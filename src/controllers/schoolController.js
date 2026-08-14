const { supabaseAdmin: supabase } = require("../config/supabase");

const currentMonthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

const nextMonthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
};

const getClasses = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("school_classes")
      .select("*, school_teachers(name)")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createClass = async (req, res, next) => {
  try {
    const { name, grade, teacher_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Class name is required." });

    if (teacher_id) {
      const { data: teacher, error: teacherError } = await supabase
        .from("school_teachers")
        .select("id")
        .eq("id", teacher_id)
        .eq("shop_id", req.user.shop_id)
        .maybeSingle();
      if (teacherError) throw teacherError;
      if (!teacher) return res.status(400).json({ message: "Teacher does not belong to this school." });
    }

    const { data, error } = await supabase
      .from("school_classes")
      .insert({ shop_id: req.user.shop_id, name: name.trim(), grade: grade?.trim() || null, teacher_id: teacher_id || null })
      .select("*, school_teachers(name)")
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Class added.", data });
  } catch (error) { next(error); }
};

const deleteClass = async (req, res, next) => {
  try {
    const { error } = await supabase.from("school_classes").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Class removed." });
  } catch (error) { next(error); }
};

const getStudents = async (req, res, next) => {
  try {
    let query = supabase
      .from("school_students")
      .select("*, school_classes(name)")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });
    if (req.query.class_id) query = query.eq("class_id", req.query.class_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createStudent = async (req, res, next) => {
  try {
    const { name, class_id, guardian_name, guardian_phone, monthly_fee } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Student name is required." });

    if (class_id) {
      const { data: schoolClass, error: classError } = await supabase
        .from("school_classes")
        .select("id")
        .eq("id", class_id)
        .eq("shop_id", req.user.shop_id)
        .maybeSingle();
      if (classError) throw classError;
      if (!schoolClass) return res.status(400).json({ message: "Class does not belong to this school." });
    }

    const { data, error } = await supabase
      .from("school_students")
      .insert({
        shop_id: req.user.shop_id,
        name: name.trim(),
        class_id: class_id || null,
        guardian_name: guardian_name?.trim() || null,
        guardian_phone: guardian_phone?.trim() || null,
        monthly_fee: monthly_fee === "" || monthly_fee === undefined ? 0 : Number(monthly_fee),
        status: "active",
      })
      .select("*, school_classes(name)")
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Student added.", data });
  } catch (error) { next(error); }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { error } = await supabase.from("school_students").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Student removed." });
  } catch (error) { next(error); }
};

const getTeachers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("school_teachers")
      .select("*")
      .eq("shop_id", req.user.shop_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createTeacher = async (req, res, next) => {
  try {
    const { name, phone, subject, monthly_salary } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Teacher name is required." });
    const { data, error } = await supabase
      .from("school_teachers")
      .insert({
        shop_id: req.user.shop_id,
        name: name.trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        monthly_salary: monthly_salary === "" || monthly_salary === undefined ? 0 : Number(monthly_salary),
        status: "active",
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Teacher added.", data });
  } catch (error) { next(error); }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { name, phone, subject, monthly_salary, status } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name?.trim();
    if (phone !== undefined) patch.phone = phone?.trim() || null;
    if (subject !== undefined) patch.subject = subject?.trim() || null;
    if (monthly_salary !== undefined) patch.monthly_salary = Number(monthly_salary);
    if (status !== undefined) patch.status = status;
    const { data, error } = await supabase
      .from("school_teachers")
      .update(patch)
      .eq("id", req.params.id)
      .eq("shop_id", req.user.shop_id)
      .select()
      .single();
    if (error) throw error;
    res.json({ message: "Teacher updated.", data });
  } catch (error) { next(error); }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const { error } = await supabase.from("school_teachers").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Teacher removed." });
  } catch (error) { next(error); }
};

const getFeePayments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("school_fee_payments")
      .select("*, school_students(name)")
      .eq("shop_id", req.user.shop_id)
      .order("paid_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const getUnpaidFees = async (req, res, next) => {
  try {
    const monthStart = currentMonthStart();
    const monthEnd = nextMonthStart();
    const [{ data: students, error: studentsError }, { data: payments, error: paymentsError }] = await Promise.all([
      supabase.from("school_students").select("id, name, monthly_fee").eq("shop_id", req.user.shop_id).eq("status", "active"),
      supabase.from("school_fee_payments").select("student_id").eq("shop_id", req.user.shop_id).gte("paid_for_month", monthStart).lt("paid_for_month", monthEnd),
    ]);
    if (studentsError) throw studentsError;
    if (paymentsError) throw paymentsError;
    const paidIds = new Set((payments || []).map((p) => p.student_id));
    res.json({ data: (students || []).filter((s) => !paidIds.has(s.id)) });
  } catch (error) { next(error); }
};

const createFeePayment = async (req, res, next) => {
  try {
    const { student_id, amount, payment_method, paid_for_month } = req.body;
    if (!student_id || amount === undefined || Number(amount) <= 0) return res.status(400).json({ message: "student_id and a positive amount are required." });
    const { data: student, error: studentError } = await supabase
      .from("school_students").select("id").eq("id", student_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (studentError) throw studentError;
    if (!student) return res.status(400).json({ message: "Student does not belong to this school." });

    const { data, error } = await supabase
      .from("school_fee_payments")
      .insert({ shop_id: req.user.shop_id, student_id, amount: Number(amount), paid_for_month: paid_for_month || currentMonthStart(), payment_method: payment_method || "cash" })
      .select("*, school_students(name)")
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Fee payment recorded.", data });
  } catch (error) { next(error); }
};

const getSalaryPayments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("school_teacher_salary_payments")
      .select("*, school_teachers(name)")
      .eq("shop_id", req.user.shop_id)
      .order("paid_at", { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const getUnpaidSalaries = async (req, res, next) => {
  try {
    const monthStart = currentMonthStart();
    const monthEnd = nextMonthStart();
    const [{ data: teachers, error: teachersError }, { data: payments, error: paymentsError }] = await Promise.all([
      supabase.from("school_teachers").select("id, name, monthly_salary").eq("shop_id", req.user.shop_id).eq("status", "active"),
      supabase.from("school_teacher_salary_payments").select("teacher_id").eq("shop_id", req.user.shop_id).gte("paid_for_month", monthStart).lt("paid_for_month", monthEnd),
    ]);
    if (teachersError) throw teachersError;
    if (paymentsError) throw paymentsError;
    const paidIds = new Set((payments || []).map((p) => p.teacher_id));
    res.json({ data: (teachers || []).filter((t) => !paidIds.has(t.id)) });
  } catch (error) { next(error); }
};

const createSalaryPayment = async (req, res, next) => {
  try {
    const { teacher_id, amount, paid_for_month } = req.body;
    if (!teacher_id || amount === undefined || Number(amount) <= 0) return res.status(400).json({ message: "teacher_id and a positive amount are required." });
    const { data: teacher, error: teacherError } = await supabase
      .from("school_teachers").select("id").eq("id", teacher_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (teacherError) throw teacherError;
    if (!teacher) return res.status(400).json({ message: "Teacher does not belong to this school." });

    const { data, error } = await supabase
      .from("school_teacher_salary_payments")
      .insert({ shop_id: req.user.shop_id, teacher_id, amount: Number(amount), paid_for_month: paid_for_month || currentMonthStart() })
      .select("*, school_teachers(name)")
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Salary payment recorded.", data });
  } catch (error) { next(error); }
};

const getExams = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("school_exams")
      .select("*, school_classes(name)")
      .eq("shop_id", req.user.shop_id)
      .order("exam_date", { ascending: false, nullsFirst: false });
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createExam = async (req, res, next) => {
  try {
    const { name, class_id, exam_date, max_score } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Exam name is required." });
    if (class_id) {
      const { data: schoolClass, error: classError } = await supabase.from("school_classes").select("id").eq("id", class_id).eq("shop_id", req.user.shop_id).maybeSingle();
      if (classError) throw classError;
      if (!schoolClass) return res.status(400).json({ message: "Class does not belong to this school." });
    }
    const score = Number(max_score) || 100;
    if (score <= 0) return res.status(400).json({ message: "max_score must be greater than zero." });
    const { data, error } = await supabase
      .from("school_exams")
      .insert({ shop_id: req.user.shop_id, name: name.trim(), class_id: class_id || null, exam_date: exam_date || null, max_score: score })
      .select("*, school_classes(name)")
      .single();
    if (error) throw error;
    res.status(201).json({ message: "Exam added.", data });
  } catch (error) { next(error); }
};

const deleteExam = async (req, res, next) => {
  try {
    const { error } = await supabase.from("school_exams").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ message: "Exam removed." });
  } catch (error) { next(error); }
};

const getExamResults = async (req, res, next) => {
  try {
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id, class_id").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const { data, error } = await supabase.from("school_exam_results").select("*").eq("exam_id", exam.id).eq("shop_id", req.user.shop_id);
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const saveExamResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ message: "results must be an array." });

    const { data: exam, error: examError } = await supabase.from("school_exams").select("id, class_id, max_score").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Exam not found." });

    const studentIds = results.map((r) => r.student_id).filter(Boolean);
    if (studentIds.length) {
      const { data: students, error: studentsError } = await supabase.from("school_students").select("id, class_id").eq("shop_id", req.user.shop_id).in("id", studentIds);
      if (studentsError) throw studentsError;
      const validStudents = new Map((students || []).map((s) => [s.id, s]));
      for (const result of results) {
        const student = validStudents.get(result.student_id);
        const score = Number(result.score);
        if (!student) return res.status(400).json({ message: "One or more students do not belong to this school." });
        if (exam.class_id && student.class_id !== exam.class_id) return res.status(400).json({ message: "All results must belong to the exam class." });
        if (!Number.isFinite(score) || score < 0 || score > Number(exam.max_score)) return res.status(400).json({ message: `Scores must be between 0 and ${exam.max_score}.` });
      }
    }

    if (results.length) {
      const rows = results.map((r) => ({ shop_id: req.user.shop_id, exam_id: exam.id, student_id: r.student_id, score: Number(r.score) }));
      const { data, error } = await supabase.from("school_exam_results").upsert(rows, { onConflict: "exam_id,student_id" }).select();
      if (error) throw error;
      return res.json({ message: "Results saved.", data });
    }
    res.json({ message: "No results to save.", data: [] });
  } catch (error) { next(error); }
};

module.exports = {
  getClasses, createClass, deleteClass,
  getStudents, createStudent, deleteStudent,
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getFeePayments, getUnpaidFees, createFeePayment,
  getSalaryPayments, getUnpaidSalaries, createSalaryPayment,
  getExams, createExam, deleteExam,
  getExamResults, saveExamResults,
};
