const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase, supabaseAdmin } = require("../config/supabase");

const PHONE_PATTERN = /^(61|62|68)\d{7}$/;

const normalizePhone = (value = "") => String(value).replace(/\D/g, "");

const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const signToken = (user, shop) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      phone: user.phone || null,
      shop_id: shop?.id || null,
      shop_name: shop?.shop_name || null,
      onboarding_required: !shop
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

const getShopForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("id, owner_id, shop_name, location, created_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const signup = async (req, res, next) => {
  try {
    const { email, phone, password, shop_name, location, setup_code } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);
    const requiredSetupCode = String(process.env.ACCOUNT_SETUP_CODE || "").trim();
    const submittedSetupCode = String(setup_code || "").trim();

    if (!requiredSetupCode) {
      return res.status(503).json({ message: "Account creation is locked. Add ACCOUNT_SETUP_CODE to the server .env first." });
    }

    if (submittedSetupCode !== requiredSetupCode) {
      return res.status(403).json({ message: "Only the Sahel owner can create new business accounts." });
    }

    if (!normalizedEmail || !password || !shop_name) {
      return res.status(400).json({ message: "email, password, and shop_name are required." });
    }

    if (normalizedPhone && !PHONE_PATTERN.test(normalizedPhone)) {
      return res.status(400).json({ message: "Phone must be 9 digits and start with 61, 62, or 68." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    if (normalizedPhone) {
      const { data: existingPhoneUser, error: phoneLookupError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (phoneLookupError) throw phoneLookupError;

      if (existingPhoneUser) {
        return res.status(409).json({ message: "An account with this phone number already exists." });
      }
    }

    const { data: existingEmailUser, error: emailLookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (emailLookupError) throw emailLookupError;

    if (existingEmailUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: normalizedEmail,
          phone: normalizedPhone || null,
          recovery_email: normalizedEmail,
          password_hash: passwordHash,
          shop_name
        }
      ])
      .select("id, email, phone, recovery_email, shop_name, created_at")
      .single();

    if (userError) throw userError;

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert([
        {
          owner_id: user.id,
          shop_name,
          location
        }
      ])
      .select("id, owner_id, shop_name, location, created_at")
      .single();

    if (shopError) throw shopError;

    const token = signToken(user, shop);

    res.status(201).json({
      data: {
        token,
        user,
        shop
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = String(phone || email || identifier || "").trim();
    const phoneCandidate = normalizePhone(loginId);

    if (!loginId || !password) {
      return res.status(400).json({ message: "phone and password are required." });
    }

    const isPhoneLogin = PHONE_PATTERN.test(phoneCandidate) && !loginId.includes("@");
    const userLookup = supabaseAdmin
      .from("users")
      .select("id, email, phone, recovery_email, password_hash, shop_name, created_at");

    const { data: user, error: userError } = await (isPhoneLogin
      ? userLookup.eq("phone", phoneCandidate).single()
      : userLookup.eq("email", normalizeEmail(loginId)).single());

    if (userError || !user) {
      return res.status(401).json({ message: "Invalid phone/email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid phone/email or password." });
    }

    const shop = await getShopForUser(user.id);

    if (!shop) {
      return res.status(403).json({ message: "Shop setup is required for this account." });
    }

    const token = signToken(user, shop);
    const { password_hash, ...safeUser } = user;

    res.json({
      data: {
        token,
        user: safeUser,
        shop
      }
    });
  } catch (error) {
    next(error);
  }
};

const oauthSession = async (req, res, next) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "access_token is required." });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(access_token);

    if (authError || !authData?.user?.email) {
      return res.status(401).json({ message: "Invalid Google session." });
    }

    const email = authData.user.email.trim().toLowerCase();

    let { data: user, error: userLookupError } = await supabaseAdmin
      .from("users")
      .select("id, email, shop_name, created_at")
      .eq("email", email)
      .maybeSingle();

    if (userLookupError) throw userLookupError;

    if (!user) {
      const { data: createdUser, error: createUserError } = await supabaseAdmin
        .from("users")
        .insert({
          email,
          password_hash: "supabase_google_oauth",
          shop_name: "Pending setup"
        })
        .select("id, email, shop_name, created_at")
        .single();

      if (createUserError) throw createUserError;
      user = createdUser;
    }

    const shop = await getShopForUser(user.id);
    const token = signToken(user, shop);

    res.json({
      data: {
        token,
        user,
        shop,
        onboarding_required: !shop
      }
    });
  } catch (error) {
    next(error);
  }
};

const setupShop = async (req, res, next) => {
  try {
    const { shop_name, location } = req.body;

    if (!shop_name) {
      return res.status(400).json({ message: "shop_name is required." });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, shop_name, created_at")
      .eq("id", req.user.user_id)
      .single();

    if (userError) throw userError;

    const existingShop = await getShopForUser(user.id);

    if (existingShop) {
      const token = signToken(user, existingShop);
      return res.json({
        data: {
          token,
          user,
          shop: existingShop,
          onboarding_required: false
        }
      });
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert({
        owner_id: user.id,
        shop_name,
        location
      })
      .select("id, owner_id, shop_name, location, created_at")
      .single();

    if (shopError) throw shopError;

    const { data: updatedUser, error: updateUserError } = await supabaseAdmin
      .from("users")
      .update({ shop_name })
      .eq("id", user.id)
      .select("id, email, shop_name, created_at")
      .single();

    if (updateUserError) throw updateUserError;

    const token = signToken(updatedUser, shop);

    res.status(201).json({
      data: {
        token,
        user: updatedUser,
        shop,
        onboarding_required: false
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  oauthSession,
  setupShop
};
