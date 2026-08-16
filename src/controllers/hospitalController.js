const { supabaseAdmin: supabase } = require("../config/supabase");

const clean = (value) => (typeof value === "string" ? value.trim() : value);
const nullable = (value) => clean(value) || null;

const scoped = (query, req) => query.eq("shop_id", req.user.shop_id);

const getPatients = async (req, res, next) => {
  try {
    let query = scoped(supabase.from("hospital_patients").select("*"), req).order("created_at", { ascending: false });
    if (req.query.search) {
      const search = clean(req.query.search).replace(/[%_,]/g, "");
      if (search) query = query.or(`patient_code.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createPatient = async (req, res, next) => {
  try {
    const { patient_code, full_name, gender, date_of_birth, phone, blood_group, address, emergency_contact } = req.body;
    if (!clean(patient_code) || !clean(full_name)) return res.status(400).json({ message: "Patient code and full name are required." });
    const { data, error } = await supabase.from("hospital_patients").insert({
      shop_id: req.user.shop_id, patient_code: clean(patient_code), full_name: clean(full_name), gender: nullable(gender),
      date_of_birth: date_of_birth || null, phone: nullable(phone), blood_group: nullable(blood_group), address: nullable(address),
      emergency_contact: nullable(emergency_contact),
    }).select().single();
    if (error) throw error;
    res.status(201).json({ message: "Patient registered.", data });
  } catch (error) { next(error); }
};

const updatePatient = async (req, res, next) => {
  try {
    const patch = {};
    ["patient_code", "full_name", "gender", "phone", "blood_group", "address", "emergency_contact"].forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = nullable(req.body[key]);
    });
    if (req.body.date_of_birth !== undefined) patch.date_of_birth = req.body.date_of_birth || null;
    const { data, error } = await scoped(supabase.from("hospital_patients").update(patch).eq("id", req.params.id), req).select().single();
    if (error) throw error;
    res.json({ message: "Patient updated.", data });
  } catch (error) { next(error); }
};

const deletePatient = async (req, res, next) => {
  try {
    const { error } = await scoped(supabase.from("hospital_patients").delete().eq("id", req.params.id), req);
    if (error) throw error;
    res.json({ message: "Patient removed." });
  } catch (error) { next(error); }
};

const getDepartments = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_departments").select("*"), req).order("name");
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const getStaff = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_staff").select("*, hospital_departments(id,name)"), req).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createStaff = async (req, res, next) => {
  try {
    const { user_id, employee_id, full_name, role, department_id, phone, license_number, active = true } = req.body;
    if (!clean(full_name) || !clean(role)) return res.status(400).json({ message: "Full name and role are required." });
    const { data, error } = await supabase.from("hospital_staff").insert({
      shop_id: req.user.shop_id, user_id: user_id || null, employee_id: nullable(employee_id), full_name: clean(full_name), role: clean(role),
      department_id: department_id || null, phone: nullable(phone), license_number: nullable(license_number), active: Boolean(active),
    }).select("*, hospital_departments(id,name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Staff member added.", data });
  } catch (error) { next(error); }
};

const updateStaff = async (req, res, next) => {
  try {
    const patch = {};
    ["employee_id", "full_name", "role", "phone", "license_number"].forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = nullable(req.body[key]);
    });
    ["user_id", "department_id"].forEach((key) => { if (req.body[key] !== undefined) patch[key] = req.body[key] || null; });
    if (req.body.active !== undefined) patch.active = Boolean(req.body.active);
    const { data, error } = await scoped(supabase.from("hospital_staff").update(patch).eq("id", req.params.id), req).select("*, hospital_departments(id,name)").single();
    if (error) throw error;
    res.json({ message: "Staff member updated.", data });
  } catch (error) { next(error); }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { error } = await scoped(supabase.from("hospital_staff").delete().eq("id", req.params.id), req);
    if (error) throw error;
    res.json({ message: "Staff member removed." });
  } catch (error) { next(error); }
};

const getAppointments = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_appointments").select("*, hospital_patients(id,patient_code,full_name), hospital_staff!hospital_appointments_doctor_id_fkey(id,full_name,role), hospital_departments(id,name)"), req).order("starts_at");
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, department_id, starts_at, ends_at, status = "scheduled", payment_status = "unpaid", notes } = req.body;
    if (!patient_id || !starts_at) return res.status(400).json({ message: "Patient and appointment start time are required." });
    const { data: patient, error: patientError } = await scoped(supabase.from("hospital_patients").select("id"), req).eq("id", patient_id).maybeSingle();
    if (patientError) throw patientError;
    if (!patient) return res.status(400).json({ message: "Patient does not belong to this hospital." });
    const { data, error } = await supabase.from("hospital_appointments").insert({
      shop_id: req.user.shop_id, patient_id, doctor_id: doctor_id || null, department_id: department_id || null,
      starts_at, ends_at: ends_at || null, status, payment_status, notes: nullable(notes), created_by: req.user.id || null,
    }).select("*, hospital_patients(id,patient_code,full_name), hospital_departments(id,name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Appointment created.", data });
  } catch (error) { next(error); }
};

const updateAppointment = async (req, res, next) => {
  try {
    const patch = {};
    ["patient_id", "doctor_id", "department_id", "starts_at", "ends_at", "status", "payment_status", "notes"].forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = ["doctor_id", "department_id", "ends_at", "notes"].includes(key) ? (req.body[key] || null) : req.body[key];
    });
    const { data, error } = await scoped(supabase.from("hospital_appointments").update(patch).eq("id", req.params.id), req).select("*, hospital_patients(id,patient_code,full_name), hospital_departments(id,name)").single();
    if (error) throw error;
    res.json({ message: "Appointment updated.", data });
  } catch (error) { next(error); }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { error } = await scoped(supabase.from("hospital_appointments").delete().eq("id", req.params.id), req);
    if (error) throw error;
    res.json({ message: "Appointment removed." });
  } catch (error) { next(error); }
};

const getMedicines = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_medicines").select("*"), req).order("name");
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createMedicine = async (req, res, next) => {
  try {
    const { name, sku, quantity = 0, reorder_level = 0, expiry_date, unit_cost = 0, selling_price = 0, active = true } = req.body;
    if (!clean(name)) return res.status(400).json({ message: "Medicine name is required." });
    const { data, error } = await supabase.from("hospital_medicines").insert({ shop_id: req.user.shop_id, name: clean(name), sku: nullable(sku), quantity: Number(quantity), reorder_level: Number(reorder_level), expiry_date: expiry_date || null, unit_cost: Number(unit_cost), selling_price: Number(selling_price), active: Boolean(active) }).select().single();
    if (error) throw error;
    res.status(201).json({ message: "Medicine added.", data });
  } catch (error) { next(error); }
};

const updateMedicine = async (req, res, next) => {
  try {
    const patch = {};
    ["name", "sku", "expiry_date"].forEach((key) => { if (req.body[key] !== undefined) patch[key] = req.body[key] || null; });
    ["quantity", "reorder_level", "unit_cost", "selling_price"].forEach((key) => { if (req.body[key] !== undefined) patch[key] = Number(req.body[key]); });
    if (req.body.active !== undefined) patch.active = Boolean(req.body.active);
    const { data, error } = await scoped(supabase.from("hospital_medicines").update(patch).eq("id", req.params.id), req).select().single();
    if (error) throw error;
    res.json({ message: "Medicine updated.", data });
  } catch (error) { next(error); }
};

const deleteMedicine = async (req, res, next) => {
  try {
    const { error } = await scoped(supabase.from("hospital_medicines").delete().eq("id", req.params.id), req);
    if (error) throw error;
    res.json({ message: "Medicine removed." });
  } catch (error) { next(error); }
};

const getLabRequests = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_lab_requests").select("*, hospital_patients(id,patient_code,full_name), hospital_staff(id,full_name,role)"), req).order("requested_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createLabRequest = async (req, res, next) => {
  try {
    const { patient_id, requested_by, test_name } = req.body;
    if (!patient_id || !clean(test_name)) return res.status(400).json({ message: "Patient and test name are required." });
    const { data, error } = await supabase.from("hospital_lab_requests").insert({ shop_id: req.user.shop_id, patient_id, requested_by: requested_by || null, test_name: clean(test_name) }).select("*, hospital_patients(id,patient_code,full_name), hospital_staff(id,full_name,role)").single();
    if (error) throw error;
    res.status(201).json({ message: "Laboratory request created.", data });
  } catch (error) { next(error); }
};

const updateLabRequest = async (req, res, next) => {
  try {
    const patch = {};
    if (req.body.status !== undefined) patch.status = req.body.status;
    if (req.body.result !== undefined) patch.result = req.body.result;
    if (req.body.completed_at !== undefined) patch.completed_at = req.body.completed_at || null;
    const { data, error } = await scoped(supabase.from("hospital_lab_requests").update(patch).eq("id", req.params.id), req).select("*, hospital_patients(id,patient_code,full_name), hospital_staff(id,full_name,role)").single();
    if (error) throw error;
    res.json({ message: "Laboratory request updated.", data });
  } catch (error) { next(error); }
};

const getBills = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_bills").select("*, hospital_patients(id,patient_code,full_name)"), req).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createBill = async (req, res, next) => {
  try {
    const { patient_id, invoice_number, total = 0, paid = 0, status = "unpaid" } = req.body;
    if (!patient_id || !clean(invoice_number)) return res.status(400).json({ message: "Patient and invoice number are required." });
    const { data, error } = await supabase.from("hospital_bills").insert({ shop_id: req.user.shop_id, patient_id, invoice_number: clean(invoice_number), total: Number(total), paid: Number(paid), status }).select("*, hospital_patients(id,patient_code,full_name)").single();
    if (error) throw error;
    res.status(201).json({ message: "Bill created.", data });
  } catch (error) { next(error); }
};

const updateBill = async (req, res, next) => {
  try {
    const patch = {};
    ["total", "paid"].forEach((key) => { if (req.body[key] !== undefined) patch[key] = Number(req.body[key]); });
    if (req.body.status !== undefined) patch.status = req.body.status;
    const { data, error } = await scoped(supabase.from("hospital_bills").update(patch).eq("id", req.params.id), req).select("*, hospital_patients(id,patient_code,full_name)").single();
    if (error) throw error;
    res.json({ message: "Bill updated.", data });
  } catch (error) { next(error); }
};

const getDevices = async (req, res, next) => {
  try {
    const { data, error } = await scoped(supabase.from("hospital_attendance_devices").select("*"), req).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createDevice = async (req, res, next) => {
  try {
    const { name, location, manufacturer, model, device_type, connection_type, external_device_id, status = "offline", config = {} } = req.body;
    if (!clean(name) || !clean(device_type)) return res.status(400).json({ message: "Device name and device type are required." });
    const { data, error } = await supabase.from("hospital_attendance_devices").insert({ shop_id: req.user.shop_id, name: clean(name), location: nullable(location), manufacturer: nullable(manufacturer), model: nullable(model), device_type: clean(device_type), connection_type: nullable(connection_type), external_device_id: nullable(external_device_id), status, config }).select().single();
    if (error) throw error;
    res.status(201).json({ message: "Device added.", data });
  } catch (error) { next(error); }
};

const updateDevice = async (req, res, next) => {
  try {
    const patch = {};
    ["name", "location", "manufacturer", "model", "device_type", "connection_type", "external_device_id", "status"].forEach((key) => { if (req.body[key] !== undefined) patch[key] = nullable(req.body[key]); });
    if (req.body.config !== undefined) patch.config = req.body.config;
    if (req.body.last_event_at !== undefined) patch.last_event_at = req.body.last_event_at || null;
    const { data, error } = await scoped(supabase.from("hospital_attendance_devices").update(patch).eq("id", req.params.id), req).select().single();
    if (error) throw error;
    res.json({ message: "Device updated.", data });
  } catch (error) { next(error); }
};

const getDashboard = async (req, res, next) => {
  try {
    const shopId = req.user.shop_id;
    const [patients, appointments, staff, medicines, labs, bills, devices] = await Promise.all([
      supabase.from("hospital_patients").select("id", { count: "exact", head: true }).eq("shop_id", shopId),
      supabase.from("hospital_appointments").select("id", { count: "exact", head: true }).eq("shop_id", shopId),
      supabase.from("hospital_staff").select("id", { count: "exact", head: true }).eq("shop_id", shopId).eq("active", true),
      supabase.from("hospital_medicines").select("id", { count: "exact", head: true }).eq("shop_id", shopId).eq("active", true),
      supabase.from("hospital_lab_requests").select("id", { count: "exact", head: true }).eq("shop_id", shopId).eq("status", "pending"),
      supabase.from("hospital_bills").select("total,paid").eq("shop_id", shopId),
      supabase.from("hospital_attendance_devices").select("id", { count: "exact", head: true }).eq("shop_id", shopId),
    ]);
    for (const result of [patients, appointments, staff, medicines, labs, bills, devices]) if (result.error) throw result.error;
    const totals = (bills.data || []).reduce((acc, bill) => ({ total: acc.total + Number(bill.total || 0), paid: acc.paid + Number(bill.paid || 0) }), { total: 0, paid: 0 });
    res.json({ data: { patients: patients.count || 0, appointments: appointments.count || 0, active_staff: staff.count || 0, medicines: medicines.count || 0, pending_labs: labs.count || 0, devices: devices.count || 0, billing_total: totals.total, billing_paid: totals.paid, billing_due: totals.total - totals.paid } });
  } catch (error) { next(error); }
};

module.exports = {
  getDashboard,
  getPatients, createPatient, updatePatient, deletePatient,
  getDepartments,
  getStaff, createStaff, updateStaff, deleteStaff,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getMedicines, createMedicine, updateMedicine, deleteMedicine,
  getLabRequests, createLabRequest, updateLabRequest,
  getBills, createBill, updateBill,
  getDevices, createDevice, updateDevice,
};
