const { supabaseAdmin: supabase } = require("../config/supabase");

const VALID_PAYMENT_METHODS = ["cash", "bank"];
const OVERDUE_DAYS = 30;

function normalizePaymentMethod(value) {
  return VALID_PAYMENT_METHODS.includes(value) ? value : "cash";
}

function isOverdue(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= OVERDUE_DAYS;
}

async function getPaymentsByCreditId(creditIds, shopId) {
  if (creditIds.length === 0) return {};

  const { data, error } = await supabase
    .from("credit_payments")
    .select("id, credit_id, shop_id, amount_paid, payment_date, payment_method, notes, created_at")
    .eq("shop_id", shopId)
    .in("credit_id", creditIds)
    .order("payment_date", { ascending: true });

  if (error) throw error;

  return (data || []).reduce((lookup, payment) => {
    const key = String(payment.credit_id);
    lookup[key] = lookup[key] || [];
    lookup[key].push(payment);
    return lookup;
  }, {});
}

async function insertCreditPayment({ creditId, shopId, amountPaid, paymentMethod, notes }) {
  const { data, error } = await supabase
    .from("credit_payments")
    .insert([
      {
        credit_id: creditId,
        shop_id: shopId,
        amount_paid: amountPaid,
        payment_method: normalizePaymentMethod(paymentMethod),
        notes: notes || null
      }
    ])
    .select("id, credit_id, shop_id, amount_paid, payment_date, payment_method, notes, created_at")
    .single();

  if (error) throw error;
  return data;
}

// NEW: manually record money given to someone (a debt that is not tied to a product sale)
const createCredit = async (req, res, next) => {
  try {
    const { customer_name, customer_phone, amount_owed, notes } = req.body || {};

    const amount = Number(amount_owed);
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ message: "Customer name is required." });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount_owed must be greater than 0." });
    }

    const { data, error } = await supabase
      .from("credits")
      .insert([
        {
          shop_id: req.user.shop_id,
          sale_id: null,
          customer_name: customer_name.trim(),
          customer_phone: customer_phone ? customer_phone.trim() : null,
          amount_owed: amount,
          status: "unpaid",
          notes: notes || null,
          source: "manual"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Debt recorded.", data });
  } catch (error) {
    next(error);
  }
};

const getCredits = async (req, res, next) => {
  try {
    const status = req.query.status || "open";

    let query = supabase
      .from("credits")
      .select("*")
      .eq("shop_id", req.user.shop_id);

    if (status === "open") {
      query = query.in("status", ["unpaid", "partial"]);
    } else if (status === "overdue") {
      query = query.in("status", ["unpaid", "partial"]);
    } else if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    const creditIds = data.map((credit) => credit.id);
    const paymentsByCreditId = await getPaymentsByCreditId(creditIds, req.user.shop_id);

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

    let enrichedCredits = data.map((credit) => {
      const sale = salesById[String(credit.sale_id)];
      const product = sale ? productsById[String(sale.product_id)] : null;
      const payments = paymentsByCreditId[String(credit.id)] || [];
      const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0);
      const paidOn = credit.status === "paid" && payments.length > 0 ? payments[payments.length - 1].payment_date : null;
      const overdue = credit.status !== "paid" && isOverdue(credit.created_at);

      const items = credit.sale_id
        ? [
            {
              product_name: product?.name || "Unknown product",
              quantity: Number(sale?.quantity_sold || 1),
              amount: Number(sale?.quantity_sold || 1) * Number(sale?.selling_price || credit.amount_owed || 0)
            }
          ]
        : [
            {
              product_name: credit.notes ? `Cash given - ${credit.notes}` : "Cash given",
              quantity: 1,
              amount: Number(credit.amount_owed || 0) + totalPaid
            }
          ];

      return {
        ...credit,
        payments,
        total_paid: totalPaid,
        paid_on: paidOn,
        is_overdue: overdue,
        days_outstanding: credit.created_at
          ? Math.floor((Date.now() - new Date(credit.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        items
      };
    });

    if (status === "overdue") {
      enrichedCredits = enrichedCredits.filter((credit) => credit.is_overdue);
    }

    res.json({ data: enrichedCredits });
  } catch (error) {
    next(error);
  }
};

const markCreditPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method, notes } = req.body || {};

    const { data: credit, error: creditError } = await supabase
      .from("credits")
      .select("id, amount_owed, status")
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .single();

    if (creditError) throw creditError;

    const amountPaid = Number(credit.amount_owed || 0);
    let payment = null;

    if (amountPaid > 0) {
      payment = await insertCreditPayment({
        creditId: id,
        shopId: req.user.shop_id,
        amountPaid,
        paymentMethod: payment_method,
        notes
      });
    }

    const { data, error } = await supabase
      .from("credits")
      .update({ status: "paid", amount_owed: 0 })
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Credit marked as paid.", data: { ...data, payment } });
  } catch (error) {
    next(error);
  }
};

const recordPartialPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const amountPaid = Number(req.body.amount_paid);
    const { payment_method, notes } = req.body || {};

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
    const payment = await insertCreditPayment({
      creditId: id,
      shopId: req.user.shop_id,
      amountPaid: Math.min(amountPaid, Number(credit.amount_owed || 0)),
      paymentMethod: payment_method,
      notes
    });

    const { data, error } = await supabase
      .from("credits")
      .update({ status: nextStatus, amount_owed: remainingAmount })
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Partial payment recorded.", data: { ...data, payment } });
  } catch (error) {
    next(error);
  }
};

const getCreditSummary = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("credits")
      .select("amount_owed, status, created_at")
      .eq("shop_id", req.user.shop_id)
      .in("status", ["unpaid", "partial"]);

    if (error) throw error;

    const totalAmountOwed = data.reduce((total, credit) => {
      return total + Number(credit.amount_owed || 0);
    }, 0);

    const overdueCredits = data.filter((credit) => isOverdue(credit.created_at));
    const overdueAmount = overdueCredits.reduce((total, credit) => total + Number(credit.amount_owed || 0), 0);

    res.json({
      data: {
        total_amount_owed: totalAmountOwed,
        count: data.length,
        overdue_count: overdueCredits.length,
        overdue_amount: overdueAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCredit,
  getCredits,
  getCreditSummary,
  markCreditPaid,
  recordPartialPayment
};
