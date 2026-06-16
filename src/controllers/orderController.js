const { supabaseAdmin: supabase } = require("../config/supabase");

const VALID_STATUSES = ["pending", "partial", "received", "cancelled"];

const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status filter. Use pending, partial, received, or cancelled."
      });
    }

    let query = supabase
      .from("purchase_orders")
      .select("*")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { product_id, item_id, product_name, quantity_ordered, expected_cost, expected_arrival } = req.body;

    if (
      !product_name ||
      quantity_ordered === undefined ||
      expected_cost === undefined ||
      !expected_arrival
    ) {
      return res.status(400).json({
        message:
          "product_name, quantity_ordered, expected_cost, and expected_arrival are required."
      });
    }

    if (Number(quantity_ordered) <= 0) {
      return res.status(400).json({ message: "quantity_ordered must be greater than 0." });
    }

    const { data, error } = await supabase
      .from("purchase_orders")
      .insert([
        {
          shop_id: req.user.shop_id,
          product_id: product_id || null,
          item_id: item_id || null,
          product_name,
          quantity_ordered: Number(quantity_ordered),
          expected_cost: Number(expected_cost),
          expected_arrival,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

const receiveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity_received } = req.body;

    if (quantity_received === undefined || Number(quantity_received) <= 0) {
      return res.status(400).json({
        message: "quantity_received is required and must be greater than 0."
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .single();

    if (orderError) throw orderError;

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled orders cannot be received." });
    }

    let productQuery = supabase
      .from("products")
      .select("id, quantity")
      .eq("shop_id", req.user.shop_id);

    if (order.product_id) {
      productQuery = productQuery.eq("id", order.product_id);
    } else if (order.item_id) {
      productQuery = productQuery.eq("item_id", order.item_id);
    } else {
      productQuery = productQuery.eq("name", order.product_name);
    }

    const { data: product, error: productError } = await productQuery.single();

    if (productError) throw productError;

    const receivedQuantity = Number(quantity_received);
    const quantityOrdered = Number(order.quantity_ordered);
    const nextStatus = receivedQuantity < quantityOrdered ? "partial" : "received";

    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from("purchase_orders")
      .update({
        quantity_received: receivedQuantity,
        status: nextStatus
      })
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (updateOrderError) throw updateOrderError;

    const { data: updatedProduct, error: updateProductError } = await supabase
      .from("products")
      .update({ quantity: Number(product.quantity) + receivedQuantity })
      .eq("id", product.id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (updateProductError) throw updateProductError;

    res.json({
      message: "Purchase order received.",
      data: {
        order: updatedOrder,
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("purchase_orders")
      .update({ status: "cancelled" })
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

module.exports = {
  getOrders,
  createOrder,
  receiveOrder,
  cancelOrder
};
