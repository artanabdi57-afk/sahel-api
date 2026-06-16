const { supabaseAdmin: supabase } = require("../config/supabase");

const VALID_PAYMENT_TYPES = ["cash", "credit"];
const PHONE_PATTERN = /^(61|62|68)\d{7}$/;

const normalizeSalesPayload = (body) => {
  return Array.isArray(body) ? body : [body];
};

const validateSale = (sale, index) => {
  const requiredFields = [
    "product_id",
    "quantity_sold",
    "selling_price",
    "payment_type",
    "customer_name",
    "customer_phone"
  ];

  const missingFields = requiredFields.filter((field) => sale[field] === undefined || sale[field] === "");

  if (missingFields.length > 0) {
    return `Sale at index ${index} is missing: ${missingFields.join(", ")}.`;
  }

  if (!VALID_PAYMENT_TYPES.includes(sale.payment_type)) {
    return `Sale at index ${index} has invalid payment_type. Use cash or credit.`;
  }

  if (sale.customer_phone && sale.customer_phone !== "N/A" && !PHONE_PATTERN.test(String(sale.customer_phone))) {
    return `Sale at index ${index} has invalid customer_phone. Use 9 digits starting with 61, 62, or 68.`;
  }

  if (
    sale.payment_type === "credit" &&
    (!sale.customer_name ||
      sale.customer_name === "Walk-in" ||
      !sale.customer_phone ||
      sale.customer_phone === "N/A")
  ) {
    return `Sale at index ${index} must include the customer's real name and phone number for credit.`;
  }

  if (Number(sale.quantity_sold) <= 0) {
    return `Sale at index ${index} must have quantity_sold greater than 0.`;
  }

  if (Number(sale.selling_price) < 0) {
    return `Sale at index ${index} must have selling_price greater than or equal to 0.`;
  }

  return null;
};

const getKnownCustomers = async (shopId) => {
  const [salesResult, creditsResult] = await Promise.all([
    supabase
      .from("sales")
      .select("customer_name, customer_phone, sale_date")
      .eq("shop_id", shopId)
      .not("customer_phone", "is", null),
    supabase
      .from("credits")
      .select("customer_name, customer_phone, created_at")
      .eq("shop_id", shopId)
      .not("customer_phone", "is", null)
  ]);

  if (salesResult.error) throw salesResult.error;
  if (creditsResult.error) throw creditsResult.error;

  const rows = [
    ...(salesResult.data || []).map((row) => ({ ...row, date: row.sale_date })),
    ...(creditsResult.data || []).map((row) => ({ ...row, date: row.created_at }))
  ];

  const customersByPhone = rows.reduce((lookup, row) => {
    if (!row.customer_phone || row.customer_phone === "N/A") return lookup;
    if (!PHONE_PATTERN.test(String(row.customer_phone))) return lookup;

    const existing = lookup[row.customer_phone];
    if (!existing || new Date(row.date || 0) > new Date(existing.last_seen || 0)) {
      lookup[row.customer_phone] = {
        customer_name: row.customer_name || "Unknown customer",
        customer_phone: row.customer_phone,
        last_seen: row.date
      };
    }

    return lookup;
  }, {});

  return Object.values(customersByPhone).sort((a, b) => a.customer_name.localeCompare(b.customer_name));
};

const getCustomers = async (req, res, next) => {
  try {
    const data = await getKnownCustomers(req.user.shop_id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getRequestedQuantityByProduct = (sales) => {
  return sales.reduce((totals, sale) => {
    const productId = String(sale.product_id);
    totals[productId] = (totals[productId] || 0) + Number(sale.quantity_sold);
    return totals;
  }, {});
};

const getSales = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const { from, to } = req.query;

    let query = supabase
      .from("sales")
      .select("id, product_id, quantity_sold, selling_price, payment_type, customer_name, customer_phone, sale_date")
      .eq("shop_id", req.user.shop_id)
      .order("sale_date", { ascending: false });

    if (from) {
      query = query.gte("sale_date", from);
    }

    if (to) {
      query = query.lte("sale_date", to);
    }

    const { data: sales, error: salesError } = await query.limit(limit);

    if (salesError) throw salesError;

    const productIds = [...new Set(sales.map((sale) => sale.product_id))];
    let productsById = {};

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

    const data = sales.map((sale) => ({
      ...sale,
      product_name: productsById[String(sale.product_id)]?.name || "Unknown product",
      total: Number(sale.quantity_sold) * Number(sale.selling_price),
      status: sale.payment_type === "credit" ? "pending" : "paid"
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const recordSales = async (req, res, next) => {
  try {
    const sales = normalizeSalesPayload(req.body);

    if (sales.length === 0) {
      return res.status(400).json({ message: "At least one sale is required." });
    }

    const validationErrors = sales.map(validateSale).filter(Boolean);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Invalid sale payload.", errors: validationErrors });
    }

    const requestedQuantityByProduct = getRequestedQuantityByProduct(sales);
    const productIds = Object.keys(requestedQuantityByProduct);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("shop_id", req.user.shop_id)
      .in("id", productIds);

    if (productsError) throw productsError;

    const productsById = products.reduce((lookup, product) => {
      lookup[String(product.id)] = product;
      return lookup;
    }, {});

    const stockErrors = productIds.reduce((errors, productId) => {
      const product = productsById[productId];
      const requestedQuantity = requestedQuantityByProduct[productId];

      if (!product) {
        errors.push(`Product ${productId} was not found.`);
        return errors;
      }

      if (Number(product.quantity) < requestedQuantity) {
        errors.push(
          `Product ${productId} has ${product.quantity} in stock, but ${requestedQuantity} was requested.`
        );
      }

      return errors;
    }, []);

    if (stockErrors.length > 0) {
      return res.status(400).json({ message: "Insufficient stock.", errors: stockErrors });
    }

    const knownCustomers = await getKnownCustomers(req.user.shop_id);
    const customersByPhone = knownCustomers.reduce((lookup, customer) => {
      lookup[customer.customer_phone] = customer;
      return lookup;
    }, {});

    const saleRows = sales.map((sale) => ({
      shop_id: req.user.shop_id,
      product_id: sale.product_id,
      quantity_sold: Number(sale.quantity_sold),
      selling_price: Number(sale.selling_price),
      payment_type: sale.payment_type,
      customer_name: customersByPhone[sale.customer_phone]?.customer_name || sale.customer_name,
      customer_phone: sale.customer_phone,
      sale_date: sale.sale_date || new Date().toISOString()
    }));

    const { data: createdSales, error: salesError } = await supabase
      .from("sales")
      .insert(saleRows)
      .select();

    if (salesError) throw salesError;

    const productUpdates = await Promise.all(
      productIds.map((productId) => {
        const currentQuantity = Number(productsById[productId].quantity);
        const requestedQuantity = requestedQuantityByProduct[productId];

        return supabase
          .from("products")
          .update({ quantity: currentQuantity - requestedQuantity })
          .eq("id", productId)
          .eq("shop_id", req.user.shop_id)
          .select("id, quantity")
          .single();
      })
    );

    const productUpdateError = productUpdates.find((result) => result.error);

    if (productUpdateError) {
      throw productUpdateError.error;
    }

    const creditRows = createdSales
      .filter((sale) => sale.payment_type === "credit")
      .map((sale) => ({
        shop_id: req.user.shop_id,
        sale_id: sale.id,
        customer_name: sale.customer_name,
        customer_phone: sale.customer_phone,
        amount_owed: Number(sale.quantity_sold) * Number(sale.selling_price),
        status: "unpaid"
      }));

    let createdCredits = [];

    if (creditRows.length > 0) {
      const { data, error } = await supabase.from("credits").insert(creditRows).select();

      if (error) throw error;

      createdCredits = data;
    }

    res.status(201).json({
      message: "Sales recorded successfully.",
      data: {
        sales: createdSales,
        products: productUpdates.map((result) => result.data),
        credits: createdCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id, product_id, quantity_sold")
      .eq("id", id)
      .eq("shop_id", req.user.shop_id)
      .single();

    if (saleError) throw saleError;

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("id", sale.product_id)
      .eq("shop_id", req.user.shop_id)
      .single();

    if (productError) throw productError;

    const { error: creditError } = await supabase
      .from("credits")
      .delete()
      .eq("sale_id", sale.id)
      .eq("shop_id", req.user.shop_id);

    if (creditError) throw creditError;

    const { error: deleteError } = await supabase
      .from("sales")
      .delete()
      .eq("id", sale.id)
      .eq("shop_id", req.user.shop_id);

    if (deleteError) throw deleteError;

    const { data: updatedProduct, error: updateProductError } = await supabase
      .from("products")
      .update({ quantity: Number(product.quantity) + Number(sale.quantity_sold) })
      .eq("id", product.id)
      .eq("shop_id", req.user.shop_id)
      .select("id, quantity")
      .single();

    if (updateProductError) throw updateProductError;

    res.json({
      message: "Sale removed and stock restored.",
      data: {
        sale,
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getSales,
  recordSales,
  deleteSale
};
