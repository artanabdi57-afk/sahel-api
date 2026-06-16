const { supabaseAdmin: supabase } = require("../config/supabase");

async function countRows(table, filters = []) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  filters.forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function sumRows(table, column, filters = []) {
  let query = supabase.from(table).select(column);

  filters.forEach(([filterColumn, value]) => {
    query = query.eq(filterColumn, value);
  });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((total, row) => total + Number(row[column] || 0), 0);
}

const getAdminOverview = async (req, res, next) => {
  try {
    const { data: shops, error: shopsError } = await supabase
      .from("shops")
      .select("id, owner_id, shop_name, location, created_at")
      .order("created_at", { ascending: false });

    if (shopsError) throw shopsError;

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, phone, shop_name, created_at");

    if (usersError) throw usersError;

    const usersById = Object.fromEntries((users || []).map((user) => [user.id, user]));

    const shopUsage = await Promise.all(
      (shops || []).map(async (shop) => {
        const [products, sales, credits, orders, expenses, revenue, expensesTotal] = await Promise.all([
          countRows("products", [["shop_id", shop.id]]),
          countRows("sales", [["shop_id", shop.id]]),
          countRows("credits", [["shop_id", shop.id]]),
          countRows("purchase_orders", [["shop_id", shop.id]]),
          countRows("expenses", [["shop_id", shop.id]]),
          sumRows("sales", "selling_price", [["shop_id", shop.id]]),
          sumRows("expenses", "amount", [["shop_id", shop.id]])
        ]);

        return {
          ...shop,
          owner_email: usersById[shop.owner_id]?.email || "Unknown",
          owner_phone: usersById[shop.owner_id]?.phone || null,
          usage: {
            products,
            sales,
            credits,
            orders,
            expenses,
            revenue,
            expenses_total: expensesTotal
          }
        };
      })
    );

    const totals = shopUsage.reduce(
      (summary, shop) => ({
        shops: summary.shops + 1,
        users: users?.length || 0,
        products: summary.products + shop.usage.products,
        sales: summary.sales + shop.usage.sales,
        credits: summary.credits + shop.usage.credits,
        orders: summary.orders + shop.usage.orders,
        expenses: summary.expenses + shop.usage.expenses,
        revenue: summary.revenue + shop.usage.revenue,
        expenses_total: summary.expenses_total + shop.usage.expenses_total
      }),
      {
        shops: 0,
        users: users?.length || 0,
        products: 0,
        sales: 0,
        credits: 0,
        orders: 0,
        expenses: 0,
        revenue: 0,
        expenses_total: 0
      }
    );

    res.json({
      data: {
        totals,
        shops: shopUsage
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview
};
