const { supabaseAdmin: supabase } = require("../config/supabase");

const clean = (value) => typeof value === "string" ? value.trim() : value;
const validStatuses = new Set(["present", "absent", "late", "excused"]);

async function verifyClass(req, classId) {
  const { data, error } = await supabase
    .from("school_classes")
    .select("id,name,grade,level,teacher_id,school_teachers(name)")
    .eq("id", classId)
    .eq("shop_id", req.user.shop_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

const getAttendance = async (req, res, next) => {
  try {
    const classId = clean(req.query.class_id);
    const date = clean(req.query.date);
    if (!classId || !date) return res.status(400).json({ message: "class_id and date are required." });
    const schoolClass = await verifyClass(req, classId);
    if (!schoolClass) return res.status(404).json({ message: "Class does not belong to this school." });

    const [{ data: students, error: se }, { data: attendance, error: ae }] = await Promise.all([
      supabase.from("school_students").select("id,registration_no,name,class_id,status").eq("shop_id", req.user.shop_id).eq("class_id", classId).eq("status", "active").order("registration_no", { ascending: true }),
      supabase.from("school_attendance").select("id,student_id,status,note,marked_by,updated_at").eq("shop_id", req.user.shop_id).eq("class_id", classId).eq("attendance_date", date)
    ]);
    if (se) throw se;
    if (ae) throw ae;
    const byStudent = new Map((attendance || []).map(row => [row.student_id, row]));
    const rows = (students || []).map(student => ({ ...student, attendance: byStudent.get(student.id) || null }));
    const counts = rows.reduce((out, row) => {
      const status = row.attendance?.status || "unmarked";
      out[status] = (out[status] || 0) + 1;
      return out;
    }, { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 });
    res.json({ class: schoolClass, date, data: rows, counts });
  } catch (error) { next(error); }
};

const saveAttendance = async (req, res, next) => {
  try {
    const { class_id, date, records } = req.body;
    if (!class_id || !date || !Array.isArray(records)) return res.status(400).json({ message: "class_id, date and records are required." });
    const schoolClass = await verifyClass(req, class_id);
    if (!schoolClass) return res.status(404).json({ message: "Class does not belong to this school." });

    const studentIds = records.map(r => r.student_id).filter(Boolean);
    const { data: students, error: se } = await supabase.from("school_students").select("id").eq("shop_id", req.user.shop_id).eq("class_id", class_id).in("id", studentIds);
    if (se) throw se;
    const allowed = new Set((students || []).map(s => s.id));
    const rows = records.filter(r => allowed.has(r.student_id)).map(r => {
      const status = clean(r.status);
      if (!validStatuses.has(status)) throw new Error("Invalid attendance status.");
      return { shop_id: req.user.shop_id, student_id: r.student_id, class_id, attendance_date: date, status, note: clean(r.note) || null, marked_by: req.user.id || null, updated_at: new Date().toISOString() };
    });
    if (!rows.length) return res.status(400).json({ message: "No valid students were provided." });
    const { data, error } = await supabase.from("school_attendance").upsert(rows, { onConflict: "shop_id,student_id,attendance_date" }).select("id,student_id,status,note,updated_at");
    if (error) throw error;
    res.json({ message: `Attendance saved for ${data?.length || 0} students.`, data });
  } catch (error) { next(error); }
};

const getAttendanceHistory = async (req, res, next) => {
  try {
    const studentId = clean(req.query.student_id);
    const classId = clean(req.query.class_id);
    let query = supabase.from("school_attendance").select("attendance_date,status,note,school_students(name,registration_no),school_classes(name)").eq("shop_id", req.user.shop_id).order("attendance_date", { ascending: false }).limit(100);
    if (studentId) query = query.eq("student_id", studentId);
    if (classId) query = query.eq("class_id", classId);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

module.exports = { getAttendance, saveAttendance, getAttendanceHistory };
