const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase, supabaseAdmin } = require("../config/supabase");
const { withRetry } = require("../utils/withRetry");

const PHONE_PATTERN = /^(61|62|68)\d{7}$/;
const VALID_BUSINESS_TYPES = ["shop", "gym", "school"];
const normalizePhone = (value = "") => String(value).replace(/\D/g, "");
const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

// ── Sign JWT using Supabase Auth ID (auth_id) as user_id ─────────────────────
const signToken = (authId, email, phone, shop) => {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET environment variable.");
  return jwt.sign(
    {
      user_id:             authId,          // ← always Supabase Auth UUID
      email:               email,
      phone:               phone || null,
      shop_id:             shop?.id || null,
      shop_name:           shop?.shop_name || null,
      onboarding_required: !shop
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

// ── Get first shop owned by Supabase Auth ID ──────────────────────────────────
const getShopForAuthUser = async (authId) => {
  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("id, owner_id, shop_name, location, phone, status, plan, created_at")
    .eq("owner_id", authId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

// ── SIGNUP ────────────────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { email, phone, password, shop_name, location, business_type } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password || !shop_name) {
      return res.status(400).json({ message: "email, password, and shop_name are required." });
    }
    if (!business_type || !VALID_BUSINESS_TYPES.includes(business_type)) {
      return res.status(400).json({ message: `business_type must be one of: ${VALID_BUSINESS_TYPES.join(", ")}.` });
    }
    if (normalizedPhone && !PHONE_PATTERN.test(normalizedPhone)) {
      return res.status(400).json({ message: "Phone must be 9 digits and start with 61, 62, or 68." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // Create in Supabase Auth — this is the source of truth for user_id
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { shop_name, location, phone: normalizedPhone || null, business_type }
    });
    if (authError) {
      if (authError.message?.includes("already")) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
      throw authError;
    }

    const authId = authData.user.id;

    // Create shop using Supabase Auth ID as owner_id
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert([{ owner_id: authId, shop_name, location, phone: normalizedPhone || null, business_type, status: "active", plan: "free" }])
      .select("id, owner_id, shop_name, location, phone, business_type, status, plan, created_at")
      .single();
    if (shopError) throw shopError;

    const token = signToken(authId, normalizedEmail, normalizedPhone, shop);
    const user = { id: authId, email: normalizedEmail, phone: normalizedPhone || null, shop_name };

    res.status(201).json({ data: { token, user, shop } });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = String(phone || email || identifier || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const normalizedEmail = normalizeEmail(loginId);

    // Try Supabase Auth sign in first (owners)
    const { data: authData, error: authError } = await withRetry(() =>
      supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
    );

    if (!authError && authData?.user) {
      // Owner login via Supabase Auth
      const authId = authData.user.id;
      const shop = await getShopForAuthUser(authId);

      if (!shop) {
        return res.status(403).json({ message: "Shop setup is required for this account." });
      }
      if (shop.status === "suspended") {
        return res.status(403).json({ message: "This shop account is suspended." });
      }

      const token = signToken(authId, authData.user.email, null, shop);
      const user = { id: authId, email: authData.user.email, phone: null, shop_name: shop.shop_name };

      return res.json({ data: { token, user, shop } });
    }

    // Fall back to staff_members table
    const { data: staffData, error: staffError } = await withRetry(() =>
      supabaseAdmin.rpc("staff_login", {
        p_email: normalizedEmail,
        p_password: password,
      })
    );

    if (staffError || !staffData) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const staff = staffData;
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name, location, status, plan")
      .eq("id", staff.shop_id)
      .single();

    if (shopError || !shop) {
      return res.status(403).json({ message: "Shop not found." });
    }
    if (shop.status === "suspended") {
      return res.status(403).json({ message: "This shop is suspended." });
    }

    const token = jwt.sign(
      {
        user_id:   staff.id,
        email:     staff.email,
        phone:     staff.phone || null,
        shop_id:   staff.shop_id,
        shop_name: shop.shop_name,
        role:      staff.role || "staff",
        is_staff:  true,
        onboarding_required: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      data: {
        token,
        user: { id: staff.id, email: staff.email, phone: staff.phone || null, name: staff.name, role: staff.role || "staff" },
        shop,
        is_staff: true,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ── OAUTH SESSION ─────────────────────────────────────────────────────────────
const oauthSession = async (req, res, next) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: "access_token is required." });

    const { data: authData, error: authError } = await withRetry(() =>
      supabase.auth.getUser(access_token)
    );
    if (authError || !authData?.user?.email) {
      // Log WHY it failed and WHICH Supabase project this backend is
      // pointed at (host only, never the key) — this is what's needed to
      // tell "wrong/rotated SUPABASE_ANON_KEY or SUPABASE_URL on the
      // backend" apart from "token genuinely invalid or expired".
      console.error("[oauth-session] getUser rejected token", {
        message: authError?.message,
        status: authError?.status,
        backendSupabaseHost: (() => {
          try { return new URL(process.env.SUPABASE_URL).host; } catch { return "INVALID_OR_MISSING_SUPABASE_URL"; }
        })(),
      });
      return res.status(401).json({ message: "Invalid Google session." });
    }

    const authId = authData.user.id;
    const email  = authData.user.email.trim().toLowerCase();

    // Get shop using Supabase Auth ID directly
    const shop = await getShopForAuthUser(authId);
    const token = signToken(authId, email, null, shop);
    const user  = { id: authId, email, phone: null, shop_name: shop?.shop_name || null };

    res.json({ data: { token, user, shop, onboarding_required: !shop } });
  } catch (error) {
    next(error);
  }
};

// ── SETUP SHOP ────────────────────────────────────────────────────────────────
const setupShop = async (req, res, next) => {
  try {
    const { shop_name, location, phone, business_type } = req.body;
    if (!shop_name) return res.status(400).json({ message: "shop_name is required." });
    if (!business_type || !VALID_BUSINESS_TYPES.includes(business_type)) {
      return res.status(400).json({ message: `business_type must be one of: ${VALID_BUSINESS_TYPES.join(", ")}.` });
    }

    const authId = req.user.user_id;  // ← Supabase Auth ID from JWT
    const email  = req.user.email;

    const existingShop = await getShopForAuthUser(authId);
    if (existingShop) {
      // business_type is locked once a shop exists — never overwritten here,
      // even if a stale onboarding form somehow re-submits.
      const token = signToken(authId, email, null, existingShop);
      return res.json({ data: { token, user: { id: authId, email }, shop: existingShop, onboarding_required: false } });
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert({ owner_id: authId, shop_name, location, phone: phone || null, business_type, status: "active", plan: "free" })
      .select("id, owner_id, shop_name, location, phone, business_type, status, plan, created_at")
      .single();
    if (shopError) throw shopError;

    const token = signToken(authId, email, null, shop);
    res.status(201).json({ data: { token, user: { id: authId, email }, shop, onboarding_required: false } });
  } catch (error) {
    next(error);
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "current_password and new_password are required." });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    // Update password in Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.user_id, {
      password: new_password
    });
    if (error) throw error;

    res.json({ message: "Password changed." });
  } catch (error) {
    next(error);
  }
};

// ── SWITCH SHOP ───────────────────────────────────────────────────────────────
const switchShop = async (req, res, next) => {
  try {
    const { shop_id } = req.body;
    if (!shop_id) return res.status(400).json({ message: "shop_id is required." });

    const authId = req.user.user_id;  // ← Supabase Auth ID from JWT

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, owner_id, shop_name, location, phone, status, plan")
      .eq("id", shop_id)
      .eq("owner_id", authId)         // ← matches Supabase Auth ID
      .single();

    if (shopError || !shop) {
      return res.status(403).json({ message: "Shop not found or access denied." });
    }
    if (shop.status === "suspended") {
      return res.status(403).json({ message: "This shop is suspended." });
    }

    const token = signToken(authId, req.user.email, null, shop);
    const user  = { id: authId, email: req.user.email };

    res.json({ data: { token, user, shop } });
  } catch (error) {
    next(error);
  }
};

// ── STAFF LOGIN ───────────────────────────────────────────────────────────────
const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required." });

    const { data, error } = await supabaseAdmin.rpc("staff_login", {
      p_email: email.trim().toLowerCase(),
      p_password: password,
    });

    if (error || !data) return res.status(401).json({ message: "Invalid email or password." });

    const staff = data;
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name, location, status, plan")
      .eq("id", staff.shop_id)
      .single();

    if (shopError || !shop) return res.status(403).json({ message: "Shop not found." });
    if (shop.status === "suspended") return res.status(403).json({ message: "This shop is suspended." });

    const token = jwt.sign(
      { user_id: staff.id, email: staff.email, phone: staff.phone || null, shop_id: staff.shop_id, shop_name: shop.shop_name, role: staff.role || "staff", is_staff: true, onboarding_required: false },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      data: {
        token,
        user: { id: staff.id, email: staff.email, phone: staff.phone || null, name: staff.name, role: staff.role || "staff" },
        shop,
        is_staff: true,
      }
    });
  } catch (error) {
    if (error.message?.includes("Invalid")) return res.status(401).json({ message: "Invalid email or password." });
    next(error);
  }
};

module.exports = { changePassword, signup, login, oauthSession, setupShop, switchShop, staffLogin };
