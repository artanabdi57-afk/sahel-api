const { supabaseAdmin: supabase } = require("../config/supabase");

const getProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, item_id, name, quantity, unit, cost_price, selling_price, low_stock_threshold, created_at")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, item_id, name, quantity, unit, cost_price, selling_price, low_stock_threshold, created_at")
      .eq("shop_id", req.user.shop_id)
      .order("quantity", { ascending: true });
    if (error) throw error;
    const lowStockProducts = data.filter((product) => {
      return Number(product.quantity) < Number(product.low_stock_threshold);
    });
    res.json({ data: lowStockProducts });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .single();
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { item_id, name, quantity, unit, cost_price, selling_price, low_stock_threshold } = req.body;
    if (
      !name ||
      quantity === undefined ||
      cost_price === undefined ||
      selling_price === undefined ||
      low_stock_threshold === undefined
    ) {
      return res.status(400).json({
        message: "name, quantity, cost_price, selling_price, and low_stock_threshold are required."
      });
    }
    const { data, error } = await supabase
      .from("products")
      .insert([{
        shop_id:             req.user.shop_id,
        item_id:             item_id || null,
        name,
        quantity,
        unit:                unit || "piece",   // ← fixed: unit now saved correctly
        cost_price,
        selling_price,
        low_stock_threshold
      }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name",
      "item_id",
      "quantity",
      "unit",               // ← fixed: unit can now be updated
      "cost_price",
      "selling_price",
      "low_stock_threshold"
    ];
    const updates = allowedFields.reduce((payload, field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
      return payload;
    }, {});
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "At least one field is required."
      });
    }
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
