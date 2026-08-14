const { supabaseAdmin: supabase } = require("../config/supabase");

const getMembers = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("gym_members").select("*").eq("shop_id", req.user.shop_id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createMember = async (req, res, next) => {
  try {
    const { name, phone, gender, join_date, registration_fee, registration_paid_until, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "name is required." });
    const fee = registration_fee === "" || registration_fee === undefined ? 0 : Number(registration_fee);
    if (!Number.isFinite(fee) || fee < 0) return res.status(400).json({ message: "registration_fee must be a valid non-negative number." });
    const { data, error } = await supabase.from("gym_members").insert({
      shop_id: req.user.shop_id, name: name.trim(), phone: phone?.trim() || null, gender: gender || null,
      join_date: join_date || new Date().toISOString().slice(0, 10), registration_fee: fee,
      registration_paid_until: registration_paid_until || null, status: "active", notes: notes?.trim() || null,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ message: "Member added.", data });
  } catch (error) { next(error); }
};

const updateMember = async (req, res, next) => {
  try {
    const { name, phone, gender, registration_fee, registration_paid_until, status, notes } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name?.trim();
    if (phone !== undefined) patch.phone = phone?.trim() || null;
    if (gender !== undefined) patch.gender = gender || null;
    if (registration_fee !== undefined) patch.registration_fee = Number(registration_fee);
    if (registration_paid_until !== undefined) patch.registration_paid_until = registration_paid_until || null;
    if (status !== undefined) patch.status = status;
    if (notes !== undefined) patch.notes = notes?.trim() || null;
    if (!Object.keys(patch).length) return res.status(400).json({ message: "No changes supplied." });
    const { data, error } = await supabase.from("gym_members").update(patch).eq("id", req.params.id).eq("shop_id", req.user.shop_id).select().single();
    if (error) throw error;
    res.json({ message: "Member updated.", data });
  } catch (error) { next(error); }
};

const deleteMember = async (req, res, next) => {
  try {
    const { error } = await supabase.from("gym_members").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Member removed." });
  } catch (error) { next(error); }
};

const getCheckins = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const { data, error } = await supabase.from("gym_checkins").select("*, gym_members(name)").eq("shop_id", req.user.shop_id).order("checked_in_at", { ascending: false }).limit(limit);
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createCheckin = async (req, res, next) => {
  try {
    const { member_id } = req.body;
    if (!member_id) return res.status(400).json({ message: "member_id is required." });
    const { data: member, error: memberError } = await supabase.from("gym_members").select("id, status").eq("id", member_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (memberError) throw memberError;
    if (!member) return res.status(400).json({ message: "Member does not belong to this gym." });
    if (member.status && member.status !== "active") return res.status(400).json({ message: "This member is not active." });
    const { data, error } = await supabase.from("gym_checkins").insert({ shop_id: req.user.shop_id, member_id }).select("*, gym_members(name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Checked in.", data });
  } catch (error) { next(error); }
};

const getPayments = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("gym_payments").select("*, gym_members(name)").eq("shop_id", req.user.shop_id).order("paid_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createPayment = async (req, res, next) => {
  try {
    const { member_id, amount, paid_for_month, payment_method, extend_paid_until } = req.body;
    if (!member_id || amount === undefined || Number(amount) <= 0) return res.status(400).json({ message: "member_id and a positive amount are required." });
    const { data: member, error: memberError } = await supabase.from("gym_members").select("id").eq("id", member_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (memberError) throw memberError;
    if (!member) return res.status(400).json({ message: "Member does not belong to this gym." });
    const { data: payment, error } = await supabase.from("gym_payments").insert({
      shop_id: req.user.shop_id, member_id, amount: Number(amount), paid_for_month: paid_for_month || new Date().toISOString().slice(0, 10), payment_method: payment_method || "cash",
    }).select("*, gym_members(name)").single();
    if (error) throw error;
    if (extend_paid_until) {
      const { error: updateError } = await supabase.from("gym_members").update({ registration_paid_until: extend_paid_until }).eq("id", member_id).eq("shop_id", req.user.shop_id);
      if (updateError) throw updateError;
    }
    res.status(201).json({ message: "Payment recorded.", data: payment });
  } catch (error) { next(error); }
};

const GYM_SETTINGS_DEFAULTS = { currency: "USD", default_membership_fee: 0, registration_fee: 0, male_section_enabled: true, female_section_enabled: true };

const getSettings = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("gym_settings").select("*").eq("shop_id", req.user.shop_id).maybeSingle();
    if (error) throw error;
    res.json({ data: data || { shop_id: req.user.shop_id, ...GYM_SETTINGS_DEFAULTS } });
  } catch (error) { next(error); }
};

const updateSettings = async (req, res, next) => {
  try {
    const { currency, default_membership_fee, registration_fee, male_section_enabled, female_section_enabled } = req.body;
    const patch = { shop_id: req.user.shop_id, updated_at: new Date().toISOString() };
    if (currency !== undefined) patch.currency = currency;
    if (default_membership_fee !== undefined) patch.default_membership_fee = Number(default_membership_fee);
    if (registration_fee !== undefined) patch.registration_fee = Number(registration_fee);
    if (male_section_enabled !== undefined) patch.male_section_enabled = Boolean(male_section_enabled);
    if (female_section_enabled !== undefined) patch.female_section_enabled = Boolean(female_section_enabled);
    const { data, error } = await supabase.from("gym_settings").upsert(patch, { onConflict: "shop_id" }).select().single();
    if (error) throw error;
    res.json({ message: "Settings saved.", data });
  } catch (error) { next(error); }
};

const getExpenses = async (req, res, next) => {
  try {
    let query = supabase.from("gym_expenses").select("*").eq("shop_id", req.user.shop_id).order("expense_date", { ascending: false });
    if (req.query.month) {
      const match = /^\d{4}-\d{2}$/.test(req.query.month);
      if (!match) return res.status(400).json({ message: "month must use YYYY-MM." });
      const [year, month] = req.query.month.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
      const end = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
      query = query.gte("expense_date", start).lt("expense_date", end);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createExpense = async (req, res, next) => {
  try {
    const { category, amount, description, expense_date } = req.body;
    if (!category?.trim() || amount === undefined || Number(amount) <= 0) return res.status(400).json({ message: "category and a positive amount are required." });
    const { data, error } = await supabase.from("gym_expenses").insert({ shop_id: req.user.shop_id, category: category.trim(), amount: Number(amount), description: description?.trim() || null, expense_date: expense_date || new Date().toISOString().slice(0, 10) }).select().single();
    if (error) throw error;
    res.status(201).json({ message: "Expense added.", data });
  } catch (error) { next(error); }
};

const deleteExpense = async (req, res, next) => {
  try {
    const { error } = await supabase.from("gym_expenses").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Expense removed." });
  } catch (error) { next(error); }
};

const getStaffPayments = async (req, res, next) => {
  try {
    let query = supabase.from("gym_employee_salary_payments").select("*, staff(name)").eq("shop_id", req.user.shop_id).order("paid_at", { ascending: false });
    if (req.query.staff_id) query = query.eq("staff_id", req.query.staff_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createStaffPayment = async (req, res, next) => {
  try {
    const { staff_id, amount, paid_for_month, notes } = req.body;
    if (!staff_id || amount === undefined || Number(amount) <= 0) return res.status(400).json({ message: "staff_id and a positive amount are required." });
    const { data: staff, error: staffError } = await supabase.from("staff").select("id").eq("id", staff_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (staffError) throw staffError;
    if (!staff) return res.status(400).json({ message: "Staff member does not belong to this business." });
    const { data, error } = await supabase.from("gym_employee_salary_payments").insert({ shop_id: req.user.shop_id, staff_id, amount: Number(amount), paid_for_month: paid_for_month || new Date().toISOString().slice(0, 10), notes: notes?.trim() || null }).select("*, staff(name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Salary payment recorded.", data });
  } catch (error) { next(error); }
};

module.exports = { getMembers, createMember, updateMember, deleteMember, getCheckins, createCheckin, getPayments, createPayment, getSettings, updateSettings, getExpenses, createExpense, deleteExpense, getStaffPayments, createStaffPayment };
