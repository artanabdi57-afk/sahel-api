// controllers/shopController.js
const { supabaseAdmin } = require("../config/supabase");

// GET /api/shops — return all shops owned by the logged-in user
const getMyShops = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name, location, phone, status, plan, created_at")
      .eq("owner_id", req.user.user_id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) {
    next(error);
  }
};

// POST /api/shops — create a new shop for the logged-in user
const createShop = async (req, res, next) => {
  try {
    const { shop_name, location, phone } = req.body;

    if (!shop_name?.trim()) {
      return res.status(400).json({ message: "shop_name is required." });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: "phone is required." });
    }
    if (!location?.trim()) {
      return res.status(400).json({ message: "location is required." });
    }

    // Check max 4 shops per owner
    const { count, error: countError } = await supabaseAdmin
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", req.user.user_id);

    if (countError) throw countError;

    if (count >= 4) {
      return res.status(403).json({
        message: "Maximum 4 shops allowed per account. Please upgrade your plan."
      });
    }

    const { data: shop, error } = await supabaseAdmin
      .from("shops")
      .insert({
        owner_id:  req.user.user_id,   // ← uses users table ID from JWT, always correct
        shop_name: shop_name.trim(),
        location:  location.trim(),
        phone:     phone.trim(),
        status:    "active",
        plan:      "free",
      })
      .select("id, shop_name, location, phone, status, plan, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({ data: shop });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/shops/:id — delete a shop owned by the logged-in user
const deleteShop = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Make sure the shop belongs to this user
    const { data: shop, error: findError } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name")
      .eq("id", id)
      .eq("owner_id", req.user.user_id)
      .single();

    if (findError || !shop) {
      return res.status(403).json({ message: "Shop not found or access denied." });
    }

    // Delete the shop
    const { error } = await supabaseAdmin
      .from("shops")
      .delete()
      .eq("id", id)
      .eq("owner_id", req.user.user_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyShops, createShop, deleteShop };
