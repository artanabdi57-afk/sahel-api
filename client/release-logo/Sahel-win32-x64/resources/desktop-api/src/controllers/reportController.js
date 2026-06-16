const { supabaseAdmin: supabase } = require("../config/supabase");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isValidDate = (value) => {
  return value && !Number.isNaN(new Date(value).getTime());
};

const getDateRange = (req) => {
  const { from, to } = req.query;

  if (!isValidDate(from) || !isValidDate(to)) {
    return {
      error: "Valid from and to query parameters are required."
    };
  }

  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString()
  };
};

const getMonthRange = (month) => {
  if (!/^\d{4}-\d{2}$/.test(month || "")) {
    return {
      error: "month query parameter is required in YYYY-MM format."
    };
  }

  const start = new Date(`${month}-01T00:00:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    return {
      error: "month query parameter is invalid."
    };
  }

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  return {
    from: start.toISOString(),
    to: end.toISOString()
  };
};

const fetchSales = async (shopId, from, to) => {
  return supabase
    .from("sales")
    .select("id, product_id, quantity_sold, selling_price, sale_date")
    .eq("shop_id", shopId)
    .gte("sale_date", from)
    .lte("sale_date", to);
};

const fetchProductsById = async (shopId, productIds) => {
  if (productIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, cost_price")
    .eq("shop_id", shopId)
    .in("id", productIds);

  if (error) throw error;

  return data.reduce((lookup, product) => {
    lookup[String(product.id)] = product;
    return lookup;
  }, {});
};

const getProductIds = (sales) => {
  return [...new Set(sales.map((sale) => String(sale.product_id)))];
};

const calculateRevenue = (sales) => {
  return sales.reduce((total, sale) => {
    return total + Number(sale.quantity_sold) * Number(sale.selling_price);
  }, 0);
};

const calculateCostOfGoodsSold = (sales, productsById) => {
  return sales.reduce((total, sale) => {
    const product = productsById[String(sale.product_id)];
    const costPrice = product ? Number(product.cost_price) : 0;

    return total + Number(sale.quantity_sold) * costPrice;
  }, 0);
};

const getSalesReport = async (req, res, next) => {
  try {
    const range = getDateRange(req);

    if (range.error) {
      return res.status(400).json({ message: range.error });
    }

    const { data: sales, error } = await fetchSales(req.user.shop_id, range.from, range.to);

    if (error) throw error;

    const productsById = await fetchProductsById(req.user.shop_id, getProductIds(sales));
    const totalRevenue = calculateRevenue(sales);
    const totalCost = calculateCostOfGoodsSold(sales, productsById);

    res.json({
      data: {
        from: range.from,
        to: range.to,
        total_revenue: totalRevenue,
        total_cost: totalCost,
        gross_profit: totalRevenue - totalCost
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const range = getDateRange(req);

    if (range.error) {
      return res.status(400).json({ message: range.error });
    }

    const { data: sales, error } = await fetchSales(req.user.shop_id, range.from, range.to);

    if (error) throw error;

    const productsById = await fetchProductsById(req.user.shop_id, getProductIds(sales));
    const totalsByProduct = sales.reduce((totals, sale) => {
      const productId = String(sale.product_id);

      if (!totals[productId]) {
        totals[productId] = {
          product_id: sale.product_id,
          product_name: productsById[productId]?.name || null,
          quantity_sold: 0,
          revenue: 0
        };
      }

      totals[productId].quantity_sold += Number(sale.quantity_sold);
      totals[productId].revenue += Number(sale.quantity_sold) * Number(sale.selling_price);

      return totals;
    }, {});

    const data = Object.values(totalsByProduct).sort((a, b) => b.quantity_sold - a.quantity_sold);

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const getSlowMovingProducts = async (req, res, next) => {
  try {
    const to = new Date();
    const from = new Date(to.getTime() - 90 * MS_PER_DAY);

    const [{ data: products, error: productsError }, { data: sales, error: salesError }] =
      await Promise.all([
        supabase
          .from("products")
          .select("id, name, quantity, cost_price, selling_price")
          .eq("shop_id", req.user.shop_id),
        supabase
          .from("sales")
          .select("product_id")
          .eq("shop_id", req.user.shop_id)
          .gte("sale_date", from.toISOString())
          .lte("sale_date", to.toISOString())
      ]);

    if (productsError) throw productsError;
    if (salesError) throw salesError;

    const soldProductIds = new Set(sales.map((sale) => String(sale.product_id)));
    const slowMovingProducts = products.filter((product) => !soldProductIds.has(String(product.id)));

    res.json({
      data: {
        from: from.toISOString(),
        to: to.toISOString(),
        products: slowMovingProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

const getExpensesByMonth = async (shopId, month) => {
  const range = getMonthRange(month);

  if (range.error) {
    return { error: range.error };
  }

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("category, amount, expense_date")
    .eq("shop_id", shopId)
    .gte("expense_date", range.from)
    .lt("expense_date", range.to);

  if (error) throw error;

  const byCategory = expenses.reduce((totals, expense) => {
    const category = expense.category || "uncategorized";
    totals[category] = (totals[category] || 0) + Number(expense.amount);
    return totals;
  }, {});

  const categories = Object.entries(byCategory).map(([category, total]) => ({
    category,
    total
  }));

  const totalExpenses = categories.reduce((total, category) => total + category.total, 0);

  return {
    from: range.from,
    to: range.to,
    categories,
    total_expenses: totalExpenses
  };
};

const getExpensesReport = async (req, res, next) => {
  try {
    const report = await getExpensesByMonth(req.user.shop_id, req.query.month);

    if (report.error) {
      return res.status(400).json({ message: report.error });
    }

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

const getProfitReport = async (req, res, next) => {
  try {
    const monthRange = getMonthRange(req.query.month);

    if (monthRange.error) {
      return res.status(400).json({ message: monthRange.error });
    }

    const [{ data: sales, error: salesError }, expensesReport] = await Promise.all([
      fetchSales(req.user.shop_id, monthRange.from, monthRange.to),
      getExpensesByMonth(req.user.shop_id, req.query.month)
    ]);

    if (salesError) throw salesError;
    if (expensesReport.error) {
      return res.status(400).json({ message: expensesReport.error });
    }

    const productsById = await fetchProductsById(req.user.shop_id, getProductIds(sales));
    const revenue = calculateRevenue(sales);
    const costOfGoodsSold = calculateCostOfGoodsSold(sales, productsById);
    const totalExpenses = expensesReport.total_expenses;

    res.json({
      data: {
        from: monthRange.from,
        to: monthRange.to,
        revenue,
        cost_of_goods_sold: costOfGoodsSold,
        total_expenses: totalExpenses,
        net_profit: revenue - costOfGoodsSold - totalExpenses
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDailySales = async (req, res, next) => {
  try {
    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 6));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

    const { data: sales, error } = await fetchSales(req.user.shop_id, start.toISOString(), end.toISOString());

    if (error) throw error;

    const totalsByDay = {};

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start.getTime() + day * MS_PER_DAY).toISOString().slice(0, 10);
      totalsByDay[date] = {
        date,
        total_revenue: 0,
        quantity_sold: 0
      };
    }

    sales.forEach((sale) => {
      const date = new Date(sale.sale_date).toISOString().slice(0, 10);

      if (!totalsByDay[date]) {
        return;
      }

      totalsByDay[date].total_revenue += Number(sale.quantity_sold) * Number(sale.selling_price);
      totalsByDay[date].quantity_sold += Number(sale.quantity_sold);
    });

    res.json({ data: Object.values(totalsByDay) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getTopProducts,
  getSlowMovingProducts,
  getExpensesReport,
  getProfitReport,
  getDailySales
};
