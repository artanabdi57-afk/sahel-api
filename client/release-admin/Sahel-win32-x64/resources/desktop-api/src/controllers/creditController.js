const { supabaseAdmin: supabase } = require("../config/supabase");

const getCredits = async (req, res, next) => {
  try {
    const status = req.query.status || "open";

    let query = supabase
      .from("credits")
      .select("*")
      .eq("shop_id", req.user.shop_id);

    if (status === "open") {
      query = query.in("status", ["unpaid", "partial"]);
    } else if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    const saleIds = [...new Set(data.map((credit) => credit.sale_id).filter(Boolean))];
    let salesById = {};
    let productsById = {};

    if (saleIds.length > 0) {
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("id, product_id, quantity_sold, selling_price")
        .eq("shop_id", req.user.shop_id)
        .in("id", saleIds);

      if (salesError) throw salesError;

      salesById = sales.reduce((lookup, sale) => {
        lookup[String(sale.id)] = sale;
        return lookup;
      }, {});

      const productIds = [...new Set(sales.map((sale) => sale.product_id).filter(Boolean))];

      if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name")
          .eq("shop_id", req.user.shop_id)
          .in("id", productIds);

        if (productsError) throw productsError;

        productsById = products.reduce((lookup, product) => {
          lookup[String(product.id)] = product;
          return lookup;
        }, {});
      }
    }

    const enrichedCredits = data.map((credit) => {
      const sale = salesById[String(credit.sale_id)];
      const product = sale ? productsById[String(sale.product_id)] : null;

      return {
        ...credit,
        items: [
          {
            product_name: product?.name || "Unknown product",
            quantity: Number(sale?.quantity_sold || 1),
            amount: Number(sale?.quantity_sold || 1) * Number(sale?.selling_price || credit.amount_owed || 0)
          }
        ]
      };
    });

    res.json({ data: enrichedCredits });
  } catch (error) {
    next(error);
  }
};

const markCreditPaid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("credits")
      .update({ status: "paid", amount_owed: 0 })
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Credit marked as paid.", data });
  } catch (error) {
    next(error);
  }
};

const recordPartialPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const amountPaid = Number(req.body.amount_paid);

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({ message: "amount_paid must be greater than 0." });
    }

    const { data: credit, error: creditError } = await supabase
      .from("credits")
      .select("id, amount_owed")
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .single();

    if (creditError) throw creditError;

    const remainingAmount = Math.max(Number(credit.amount_owed || 0) - amountPaid, 0);
    const nextStatus = remainingAmount === 0 ? "paid" : "partial";

    const { data, error } = await supabase
      .from("credits")
      .update({ status: nextStatus, amount_owed: remainingAmount })
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Partial payment recorded.", data });
  } catch (error) {
    next(error);
  }
};

const getCreditSummary = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("credits")
      .select("amount_owed, status")
      .eq("shop_id", req.user.shop_id)
      .in("status", ["unpaid", "partial"]);

    if (error) throw error;

    const totalAmountOwed = data.reduce((total, credit) => {
      return total + Number(credit.amount_owed || 0);
    }, 0);

    res.json({
      data: {
        total_amount_owed: totalAmountOwed,
        count: data.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCredits,
  getCreditSummary,
  markCreditPaid,
  recordPartialPayment
};
