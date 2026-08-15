const { supabaseAdmin: supabase } = require("../config/supabase");
const clean = (value) => typeof value === "string" ? value.trim() : value;
const numberOrNull = (value) => value === "" || value === undefined || value === null ? null : Number(value);
const maxValue = (value, fallback = 20) => { const n = Number(value); return Number.isFinite(n) && n >= 1 && n <= 100 ? n : fallback; };
const examNumber = (value) => { const n = Number(value); return Number.isInteger(n) && n >= 1 && n <= 4 ? n : 1; };

const getExams = async (req, res, next) => {
  try {
    let query = supabase.from("school_exams").select("*, school_classes(id,name,grade,level)").eq("shop_id", req.user.shop_id).order("academic_year", { ascending: false }).order("exam_number", { ascending: true });
    if (req.query.class_id) query = query.eq("class_id", req.query.class_id);
    if (req.query.academic_year) query = query.eq("academic_year", req.query.academic_year);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) { next(error); }
};

const createExam = async (req, res, next) => {
  try {
    const { class_id, academic_year, exam_date, name } = req.body;
    if (!class_id || !academic_year) return res.status(400).json({ message: "Class and academic year are required." });
    const number = examNumber(req.body.exam_number);
    const { data: schoolClass, error: classError } = await supabase.from("school_classes").select("id,name,level").eq("id", class_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (classError) throw classError;
    if (!schoolClass) return res.status(400).json({ message: "Class does not belong to this school." });
    const year = clean(academic_year);
    const { data: existing, error: findError } = await supabase.from("school_exams").select("id").eq("shop_id", req.user.shop_id).eq("class_id", class_id).eq("academic_year", year).eq("exam_number", number).maybeSingle();
    if (findError) throw findError;
    const max = maxValue(req.body.max_score, 20);
    const payload = {
      shop_id: req.user.shop_id, class_id, term: "term_1", exam_number: number, academic_year: year,
      exam_date: exam_date || null, max_score: max,
      name: clean(name) || `${schoolClass.name} - Exam ${number}`,
      assessment_one_max: max, assessment_two_max: max, assessment_three_max: max, assessment_four_max: max,
    };
    const result = existing
      ? await supabase.from("school_exams").update(payload).eq("id", existing.id).eq("shop_id", req.user.shop_id).select("*, school_classes(id,name,grade,level)").single()
      : await supabase.from("school_exams").insert(payload).select("*, school_classes(id,name,grade,level)").single();
    if (result.error) throw result.error;
    res.status(existing ? 200 : 201).json({ message: "Exam record ready.", data: result.data });
  } catch (error) { next(error); }
};

const deleteExam = async (req, res, next) => {
  try { const { error } = await supabase.from("school_exams").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id); if (error) throw error; res.json({ message: "Exam removed." }); } catch (error) { next(error); }
};

const getExamResults = async (req, res, next) => {
  try {
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id,exam_number,academic_year,max_score,school_classes(name,level,grade)").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const { data, error } = await supabase.from("school_exam_results").select("id,student_id,subject,score,attempt_one,attempt_two,attempt_three,attempt_four,school_students(name,registration_no)").eq("exam_id", exam.id).eq("shop_id", req.user.shop_id).order("subject");
    if (error) throw error;
    res.json({ exam, data: data || [] });
  } catch (error) { next(error); }
};

const saveExamResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ message: "results must be an array." });
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id,max_score,exam_number").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const max = maxValue(exam.max_score, 20);
    const ids = [...new Set(results.map((r) => r.student_id).filter(Boolean))];
    if (ids.length) {
      const { data: students, error } = await supabase.from("school_students").select("id,class_id").eq("shop_id", req.user.shop_id).in("id", ids);
      if (error) throw error;
      const valid = new Map((students || []).map((s) => [s.id, s]));
      for (const result of results) {
        const value = numberOrNull(result.score);
        if (!valid.get(result.student_id)) return res.status(400).json({ message: "A student does not belong to this school." });
        if (valid.get(result.student_id).class_id !== exam.class_id) return res.status(400).json({ message: "All results must belong to the selected class." });
        if (!result.subject || !String(result.subject).trim()) return res.status(400).json({ message: "Every score needs a subject." });
        if (value !== null && (!Number.isFinite(value) || value < 0 || value > max)) return res.status(400).json({ message: `Score cannot exceed ${max}.` });
      }
    }
    if (!results.length) return res.json({ message: "No results to save.", data: [] });
    const rows = results.map((r) => {
      const value = numberOrNull(r.score);
      return { shop_id: req.user.shop_id, exam_id: exam.id, student_id: r.student_id, subject: clean(r.subject), attempt_one: value ?? 0, attempt_two: 0, attempt_three: 0, attempt_four: 0, score: value ?? 0 };
    });
    const { data, error } = await supabase.from("school_exam_results").upsert(rows, { onConflict: "exam_id,student_id,subject" }).select("*");
    if (error) throw error;
    res.json({ message: "Exam results saved.", data });
  } catch (error) { next(error); }
};

const getSubjects = async (req, res) => res.json({ primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"], secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"] });

module.exports = { getExams, createExam, deleteExam, getExamResults, saveExamResults, getSubjects };
