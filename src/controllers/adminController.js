const { supabaseAdmin: supabase } = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BUSINESS_TYPES = ["shop", "gym", "school", "hospital"];

async function countRows(table, filters = []) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  filters.forEach(([column, value]) => { query = query.eq(column, value); });
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function sumRows(table, column, filters = []) {
  let query = supabase.from(table).select(column);
  filters.forEach(([filterColumn, value]) => { query = query.eq(filterColumn, value); });
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((total, row) => total + Number(row[column] || 0), 0);
}

const adminLogin = async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    const configuredUser = String(process.env.ADMIN_USER || "admin").trim();
    const configuredPassword = String(process.env.ADMIN_PASS || process.env.ACCOUNT_SETUP_CODE || "");

    if (!configuredPassword || username !== configuredUser || password !== configuredPassword) {
      return res.status(401).json({ message: "Invalid platform-admin credentials." });
    }

    const token = jwt.sign(
      { scope: "platform_admin", role: "superadmin", username: configuredUser },
      process.env.JWT_SECRET,
      { expiresIn: "8h", issuer: "sahel-platform-admin" }
    );

    res.json({ data: { token, role: "superadmin", username: configuredUser, expires_in: 8 * 60 * 60 } });
  } catch (error) {
    next(error);
  }
};

const getAdminOverview = async (req, res, next) => {
  try {
    const businessType = BUSINESS_TYPES.includes(req.query.business_type) ? req.query.business_type : null;
    let shopsQuery = supabase
      .from("shops")
      .select("id, owner_id, shop_name, location, phone, status, created_at, plan, plan_expires_at, business_type, hear_about, main_problem")
      .order("created_at", { ascending: false });
    if (businessType) shopsQuery = shopsQuery.eq("business_type", businessType);

    const [{ data: shops, error: shopsError }, { data: users, error: usersError }] = await Promise.all([
      shopsQuery,
      supabase.from("users").select("id,email,phone,shop_name,status,created_at,user_role")
    ]);
    if (shopsError) throw shopsError;
    if (usersError) throw usersError;

    const usersById = Object.fromEntries((users || []).map(user => [user.id, user]));

    const rows = await Promise.all((shops || []).map(async shop => {
      const owner = usersById[shop.owner_id] || {};
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
        id: shop.id,
        business_type: shop.business_type || "shop",
        shop_name: shop.shop_name,
        owner_id: shop.owner_id,
        owner_name: owner.shop_name || owner.email || "—",
        owner_email: owner.email || "—",
        phone: shop.phone || owner.phone || null,
        location: shop.location || null,
        country: shop.location || null,
        created_at: shop.created_at,
        status: shop.status || owner.status || "active",
        owner_status: owner.status || "active",
        user_role: owner.user_role || null,
        plan: shop.plan || "free",
        plan_expiry: shop.plan_expires_at || null,
        collected: {
          email: owner.email || null,
          phone: shop.phone || owner.phone || null,
          business_name: shop.shop_name || owner.shop_name || null,
          location: shop.location || null,
          business_type: shop.business_type || "shop",
          hear_about: shop.hear_about || null,
          main_problem: shop.main_problem || null,
          registration_date: shop.created_at || owner.created_at || null
        },
        usage: { products, sales, credits, orders, expenses, revenue, expenses_total: expensesTotal }
      };
    }));

    const allShops = businessType ? rows : rows;
    const byType = Object.fromEntries(BUSINESS_TYPES.map(type => [type, allShops.filter(row => row.business_type === type).length]));
    const totals = allShops.reduce((summary, row) => {
      summary.accounts += 1;
      summary.active += row.status === "active" ? 1 : 0;
      summary.suspended += row.status === "suspended" ? 1 : 0;
      summary.revenue += row.usage.revenue;
      summary.expenses += row.usage.expenses_total;
      summary.products += row.usage.products;
      summary.sales += row.usage.sales;
      return summary;
    }, { accounts: 0, active: 0, suspended: 0, revenue: 0, expenses: 0, products: 0, sales: 0 });

    res.json({ data: { totals, by_type: byType, users: rows } });
  } catch (error) {
    next(error);
  }
};

const setShopStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) return res.status(400).json({ message: "status must be active or suspended." });

    const { data: shop, error: shopError } = await supabase.from("shops").update({ status }).eq("id", id).select("id, owner_id, shop_name, status").single();
    if (shopError) throw shopError;
    await supabase.from("users").update({ status }).eq("id", shop.owner_id);
    res.json({ data: shop });
  } catch (error) { next(error); }
};

const resetClientPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters." });
    const { data: shop, error: shopError } = await supabase.from("shops").select("owner_id").eq("id", id).single();
    if (shopError) throw shopError;
    const passwordHash = await bcrypt.hash(password, 12);
    const { error } = await supabase.from("users").update({ password_hash: passwordHash }).eq("id", shop.owner_id);
    if (error) throw error;
    res.json({ message: "Client password was updated." });
  } catch (error) { next(error); }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ["shop_name", "location", "phone", "business_type", "hear_about", "main_problem", "plan", "plan_expires_at"];
    const payload = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (payload.business_type && !BUSINESS_TYPES.includes(payload.business_type)) return res.status(400).json({ message: "Unsupported business type." });
    const { data, error } = await supabase.from("shops").update(payload).eq("id", id).select("*").single();
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

module.exports = { adminLogin, getAdminOverview, setShopStatus, resetClientPassword, updateClient };
