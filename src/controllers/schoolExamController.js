const { supabaseAdmin: supabase } = require("../config/supabase");
const clean = (value) => typeof value === "string" ? value.trim() : value;
const scoreValue = (value) => value === "" || value === undefined || value === null ? null : Number(value);
const assessmentValue = (value) => {
  const n = scoreValue(value);
  if (n === null) return null;
  return n;
};
const maxValue = (value, fallback = 20) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : fallback;
};

const getExams = async (req, res, next) => {
  try {
    let query = supabase.from("school_exams").select("*, school_classes(id,name,grade,level)").eq("shop_id", req.user.shop_id).order("academic_year", { ascending: false }).order("exam_date", { ascending: false });
    if (req.query.class_id) query = query.eq("class_id", req.query.class_id);
    if (req.query.academic_year) query = query.eq("academic_year", req.query.academic_year);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
};

const createExam = async (req, res, next) => {
  try {
    const { class_id, term, academic_year, exam_date, name } = req.body;
    if (!class_id || !term || !academic_year) return res.status(400).json({ message: "Class, academic year and term are required." });
    if (!["term_1", "term_2", "term_3"].includes(term)) return res.status(400).json({ message: "Term must be Term 1, Term 2 or Term 3." });
    const { data: schoolClass, error: classError } = await supabase.from("school_classes").select("id,name,level").eq("id", class_id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (classError) throw classError;
    if (!schoolClass) return res.status(400).json({ message: "Class does not belong to this school." });
    const year = clean(academic_year);
    const { data: existing, error: findError } = await supabase.from("school_exams").select("id").eq("shop_id", req.user.shop_id).eq("class_id", class_id).eq("academic_year", year).eq("term", term).maybeSingle();
    if (findError) throw findError;
    const payload = {
      shop_id: req.user.shop_id,
      class_id,
      term,
      academic_year: year,
      exam_date: exam_date || null,
      max_score: 100,
      name: clean(name) || `${schoolClass.name} - ${term.replace("_", " ")}`,
      assessment_one_max: maxValue(req.body.assessment_one_max),
      assessment_two_max: maxValue(req.body.assessment_two_max),
      assessment_three_max: maxValue(req.body.assessment_three_max),
      assessment_four_max: maxValue(req.body.assessment_four_max),
    };
    const result = existing
      ? await supabase.from("school_exams").update(payload).eq("id", existing.id).eq("shop_id", req.user.shop_id).select("*, school_classes(id,name,grade,level)").single()
      : await supabase.from("school_exams").insert(payload).select("*, school_classes(id,name,grade,level)").single();
    if (result.error) throw result.error;
    res.status(existing ? 200 : 201).json({ message: "Term record ready.", data: result.data });
  } catch (error) { next(error); }
};

const deleteExam = async (req, res, next) => {
  try { const { error } = await supabase.from("school_exams").delete().eq("id", req.params.id).eq("shop_id", req.user.shop_id); if (error) throw error; res.json({ message: "Term record removed." }); } catch (error) { next(error); }
};

const getExamResults = async (req, res, next) => {
  try {
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id,term,academic_year,max_score,assessment_one_max,assessment_two_max,assessment_three_max,assessment_four_max,school_classes(name,level,grade)").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Term record not found." });
    const { data, error } = await supabase.from("school_exam_results").select("id,student_id,subject,score,attempt_one,attempt_two,attempt_three,attempt_four,school_students(name,registration_no)").eq("exam_id", exam.id).eq("shop_id", req.user.shop_id).order("subject");
    if (error) throw error;
    res.json({ exam, data: data || [] });
  } catch (error) { next(error); }
};

const saveExamResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ message: "results must be an array." });
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id,assessment_one_max,assessment_two_max,assessment_three_max,assessment_four_max").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Term record not found." });
    const limits = [
      maxValue(exam.assessment_one_max),
      maxValue(exam.assessment_two_max),
      maxValue(exam.assessment_three_max),
      maxValue(exam.assessment_four_max),
    ];
    const ids = [...new Set(results.map((r) => r.student_id).filter(Boolean))];
    if (ids.length) {
      const { data: students, error } = await supabase.from("school_students").select("id,class_id").eq("shop_id", req.user.shop_id).in("id", ids);
      if (error) throw error;
      const valid = new Map((students || []).map((s) => [s.id, s]));
      for (const result of results) {
        const attempts = [result.attempt_one, result.attempt_two, result.attempt_three, result.attempt_four].map(assessmentValue);
        const labels = ["First", "Second", "Third", "Fourth"];
        if (!valid.get(result.student_id)) return res.status(400).json({ message: "A student does not belong to this school." });
        if (exam.class_id && valid.get(result.student_id).class_id !== exam.class_id) return res.status(400).json({ message: "All results must belong to the selected class." });
        if (!result.subject || !String(result.subject).trim()) return res.status(400).json({ message: "Every score needs a subject." });
        for (let i = 0; i < attempts.length; i++) {
          const value = attempts[i];
          if (value !== null && (!Number.isFinite(value) || value < 0 || value > limits[i])) {
            return res.status(400).json({ message: `${labels[i]} assessment score cannot exceed ${limits[i]}.` });
          }
        }
      }
    }
    if (!results.length) return res.json({ message: "No results to save.", data: [] });
    const rows = results.map((r) => {
      const attempts = [r.attempt_one, r.attempt_two, r.attempt_three, r.attempt_four].map((v) => assessmentValue(v) ?? 0);
      return { shop_id: req.user.shop_id, exam_id: exam.id, student_id: r.student_id, subject: clean(r.subject), attempt_one: attempts[0], attempt_two: attempts[1], attempt_three: attempts[2], attempt_four: attempts[3], score: attempts.reduce((sum, value) => sum + value, 0) };
    });
    const { data, error } = await supabase.from("school_exam_results").upsert(rows, { onConflict: "exam_id,student_id,subject" }).select("*");
    if (error) throw error;
    res.json({ message: "Results saved with the current exam limits.", data });
  } catch (error) { next(error); }
};

const getSubjects = async (req, res) => res.json({ primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"], secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"] });

module.exports = { getExams, createExam, deleteExam, getExamResults, saveExamResults, getSubjects };
