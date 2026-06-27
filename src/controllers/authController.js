// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE TWO FUNCTIONS to your existing authController.js
// Then add them to the module.exports at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/switch-shop
// Body: { shop_id }
// Header: Authorization: Bearer <current token>
// Returns a new token with the selected shop_id baked in.
const switchShop = async (req, res, next) => {
  try {
    const { shop_id } = req.body;

    if (!shop_id) {
      return res.status(400).json({ message: "shop_id is required." });
    }

    // Verify this shop actually belongs to the logged-in owner
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, owner_id, shop_name, location, status, plan")
      .eq("id", shop_id)
      .eq("owner_id", req.user.user_id)   // ← owner must match
      .single();

    if (shopError || !shop) {
      return res.status(403).json({ message: "Shop not found or access denied." });
    }

    if (shop.status === "suspended") {
      return res.status(403).json({ message: "This shop is suspended." });
    }

    // Fetch the user record
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, phone, shop_name, created_at")
      .eq("id", req.user.user_id)
      .single();

    if (userError) throw userError;

    // Issue a fresh token with the new shop_id
    const token = signToken(user, shop);

    res.json({
      data: { token, user, shop }
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/staff-login
// Body: { email, password }
// No auth header needed — this is a public login endpoint for staff.
// Calls the staff_login Supabase RPC and returns a JWT.
const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    // Call your existing staff_login RPC
    const { data, error } = await supabaseAdmin.rpc("staff_login", {
      p_email: email.trim().toLowerCase(),
      p_password: password,
    });

    if (error) throw error;
    if (!data || data.error) {
      return res.status(401).json({ message: data?.error || "Invalid email or password." });
    }

    // staff_login RPC should return { staff_id, name, email, phone, shop_id, role }
    const staff = data;

    // Fetch the shop details
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name, location, status, plan")
      .eq("id", staff.shop_id)
      .single();

    if (shopError || !shop) {
      return res.status(403).json({ message: "Shop not found." });
    }

    if (shop.status === "suspended") {
      return res.status(403).json({ message: "This shop is suspended. Contact the shop owner." });
    }

    // Build a JWT that looks like an owner token but for staff
    // We reuse signToken — staff user_id is their staff record id
    const token = jwt.sign(
      {
        user_id: staff.id,
        email: staff.email,
        phone: staff.phone || null,
        shop_id: staff.shop_id,
        shop_name: shop.shop_name,
        role: staff.role || "staff",         // ← "staff" role marker
        is_staff: true,                       // ← flag frontend can check
        onboarding_required: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      data: {
        token,
        user: {
          id: staff.id,
          email: staff.email,
          phone: staff.phone || null,
          name: staff.name,
          role: staff.role || "staff",
        },
        shop,
        is_staff: true,
      }
    });
  } catch (error) {
    // staff_login RPC raises exceptions for bad credentials
    if (error.message?.includes("Invalid")) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE your module.exports to include both new functions:
// module.exports = { changePassword, signup, login, oauthSession, setupShop,
//                    switchShop, staffLogin };
// ─────────────────────────────────────────────────────────────────────────────
