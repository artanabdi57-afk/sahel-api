const { supabaseAdmin: supabase } = require("../config/supabase");
const bcrypt = require("bcryptjs");

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
      .select("id, owner_id, shop_name, location, status, created_at")
      .order("created_at", { ascending: false });

    if (shopsError) throw shopsError;

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, phone, shop_name, status, created_at");

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
          status: shop.status || "active",
          owner_email: usersById[shop.owner_id]?.email || "Unknown",
          owner_phone: usersById[shop.owner_id]?.phone || null,
          owner_status: usersById[shop.owner_id]?.status || "active",
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

const setShopStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "status must be active or suspended." });
    }

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .update({ status })
      .eq("id", id)
      .select("id, owner_id, shop_name, location, status, created_at")
      .single();

    if (shopError) throw shopError;

    await supabase.from("users").update({ status }).eq("id", shop.owner_id);

    res.json({ data: shop });
  } catch (error) {
    next(error);
  }
};

const resetClientPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id, owner_id, shop_name")
      .eq("id", id)
      .single();

    if (shopError) throw shopError;

    const passwordHash = await bcrypt.hash(password, 12);
    const { error: userError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", shop.owner_id);

    if (userError) throw userError;

    res.json({ message: "Client password was updated." });
  } catch (error) {
    next(error);
  }
};

const deleteClientShop = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (shopError) throw shopError;

    for (const table of ["credits", "sales", "purchase_orders", "expenses", "products"]) {
      const { error } = await supabase.from(table).delete().eq("shop_id", id);
      if (error) throw error;
    }

    const { error: deleteShopError } = await supabase.from("shops").delete().eq("id", id);
    if (deleteShopError) throw deleteShopError;

    const { error: deleteUserError } = await supabase.from("users").delete().eq("id", shop.owner_id);
    if (deleteUserError) throw deleteUserError;

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
  setShopStatus,
  resetClientPassword,
  deleteClientShop
};
