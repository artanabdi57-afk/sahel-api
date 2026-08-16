const { supabaseAdmin: supabase } = require("../config/supabase");

async function getManagementDashboard(req, res, next) {
  try {
    const shopId = req.user.shop_id;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const [staff, doctors, appointments, medicines, labs, bills, expenses, todayBills, todayExpenses] = await Promise.all([
      supabase.from("hospital_staff").select("id,user_id,full_name,role,active,hospital_departments(id,name)").eq("shop_id", shopId).eq("active", true).order("full_name"),
      supabase.from("hospital_staff").select("id,user_id,full_name,role,active,hospital_departments(id,name)").eq("shop_id", shopId).eq("active", true).ilike("role", "%doctor%").order("full_name"),
      supabase.from("hospital_appointments").select("id,status,starts_at,doctor_id,department_id").eq("shop_id", shopId).gte("starts_at", start.toISOString()).lt("starts_at", end.toISOString()),
      supabase.from("hospital_medicines").select("id,name,quantity,reorder_level,selling_price,unit_cost,expiry_date").eq("shop_id", shopId).eq("active", true).order("name"),
      supabase.from("hospital_lab_requests").select("id,status,test_name,requested_at,patient_id,requested_by").eq("shop_id", shopId).order("requested_at", { ascending: false }),
      supabase.from("hospital_bills").select("total,paid,created_at,status").eq("shop_id", shopId),
      supabase.from("expenses").select("amount,category,expense_date").eq("shop_id", shopId),
      supabase.from("hospital_bills").select("total,paid,created_at,status").eq("shop_id", shopId).gte("created_at", start.toISOString()).lt("created_at", end.toISOString()),
      supabase.from("expenses").select("amount,category,expense_date").eq("shop_id", shopId).gte("expense_date", start.toISOString()).lt("expense_date", end.toISOString()),
    ]);
    for (const result of [staff, doctors, appointments, medicines, labs, bills, expenses, todayBills, todayExpenses]) if (result.error) throw result.error;
    const medicineRows = medicines.data || [], expenseRows = expenses.data || [], todayExpenseRows = todayExpenses.data || [], todayBillRows = todayBills.data || [];
    const lowStock = medicineRows.filter((item) => Number(item.quantity || 0) <= Number(item.reorder_level || 0));
    const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);
    const salaries = expenseRows.filter((e) => String(e.category || "").toLowerCase() === "salary");
    const todaySalaries = todayExpenseRows.filter((e) => String(e.category || "").toLowerCase() === "salary");
    res.json({ data: { staff: staff.data || [], doctors: doctors.data || [], today_appointments: appointments.data || [], medicines: medicineRows, low_stock: lowStock, lab_requests: labs.data || [], pending_labs: (labs.data || []).filter((x) => x.status === "pending").length, revenue_today: sum(todayBillRows, "paid"), revenue_total: sum(bills.data || [], "paid"), expenses_today: sum(todayExpenseRows, "amount"), expenses_total: sum(expenseRows, "amount"), salaries_today: sum(todaySalaries, "amount"), salaries_total: sum(salaries, "amount"), outstanding: (bills.data || []).reduce((total, row) => total + Math.max(0, Number(row.total || 0) - Number(row.paid || 0)), 0), appointment_count_today: (appointments.data || []).length, active_staff_count: (staff.data || []).length, doctor_count: (doctors.data || []).length } });
  } catch (error) { next(error); }
}

async function createHospitalStaff(req, res, next) {
  try {
    const { user_id, email, employee_id, full_name, role, department_id, phone, license_number, active = true } = req.body;
    if (!full_name || !role) return res.status(400).json({ message: "Full name and role are required." });
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const { data: loginStaff, error: findError } = await supabase.from("staff").select("id").eq("shop_id", req.user.shop_id).eq("email", normalizedEmail).maybeSingle();
      if (findError) throw findError;
      if (loginStaff) {
        const { error: roleError } = await supabase.from("staff").update({ role: String(role).trim() }).eq("id", loginStaff.id).eq("shop_id", req.user.shop_id);
        if (roleError) throw roleError;
      }
    }
    const { data, error } = await supabase.from("hospital_staff").insert({ shop_id: req.user.shop_id, user_id: user_id || null, employee_id: employee_id || null, full_name: String(full_name).trim(), role: String(role).trim(), department_id: department_id || null, phone: phone || null, license_number: license_number || null, active: Boolean(active) }).select("*, hospital_departments(id,name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Hospital staff account linked and role assigned.", data });
  } catch (error) { next(error); }
}

module.exports = { getManagementDashboard, createHospitalStaff };
