const { supabaseAdmin: supabase } = require("../config/supabase");

// ── STAFF (generic — used by Gym for now; any vertical can reuse it) ───────
const getStaff = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createStaff = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    if (!name) return res.status(400).json({ message: "name is required." });

    const { data, error } = await supabase
      .from("staff")
      .insert({
        shop_id: req.user.shop_id,
        owner_id: req.user.user_id,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@placeholder.sahel`,
        role: role || "staff",
      })
      .select().single();
    if (error) throw error;
    res.status(201).json({ message: "Staff member added.", data });
  } catch (error) { next(error); }
};

const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (email !== undefined) patch.email = email;
    if (role !== undefined) patch.role = role;
    if (status !== undefined) patch.status = status;

    const { data, error } = await supabase
      .from("staff").update(patch)
      .eq("id", id).eq("shop_id", req.user.shop_id).select().single();
    if (error) throw error;
    res.json({ message: "Staff member updated.", data });
  } catch (error) { next(error); }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("staff").delete()
      .eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Staff member removed." });
  } catch (error) { next(error); }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };
