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
      .select("id, email, phone, recovery_email, password_hash, shop_name, status, created_at");

    const { data: user, error: userError } = await (isPhoneLogin
      ? userLookup.eq("phone", phoneCandidate).single()
      : userLookup.eq("email", normalizeEmail(loginId)).single());

    // ── If not found in users table, try staff_members ──
    if (userError || !user) {
      const { data: staffData, error: staffError } = await supabaseAdmin
        .rpc("staff_login", {
          p_email: normalizeEmail(loginId),
          p_password: password,
        });

      if (staffError || !staffData) {
        return res.status(401).json({ message: "Invalid phone/email or password." });
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
          user_id:  staff.id,
          email:    staff.email,
          phone:    staff.phone || null,
          shop_id:  staff.shop_id,
          shop_name: shop.shop_name,
          role:     staff.role || "staff",
          is_staff: true,
          onboarding_required: false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      return res.json({
        data: {
          token,
          user: {
            id:    staff.id,
            email: staff.email,
            phone: staff.phone || null,
            name:  staff.name,
            role:  staff.role || "staff",
          },
          shop,
          is_staff: true,
        }
      });
    }

    // ── Normal owner login ──
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid phone/email or password." });
    }

    const shop = await getShopForUser(user.id);
    if (!shop) {
      return res.status(403).json({ message: "Shop setup is required for this account." });
    }

    if (user.status === "suspended" || shop.status === "suspended") {
      return res.status(403).json({ message: "This shop account is suspended." });
    }

    const token = signToken(user, shop);
    const { password_hash, ...safeUser } = user;

    res.json({ data: { token, user: safeUser, shop } });
  } catch (error) {
    next(error);
  }
};
