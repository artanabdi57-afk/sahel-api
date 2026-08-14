const { supabaseAdmin: supabase } = require("../config/supabase");
const clean = (value) => typeof value === "string" ? value.trim() : value;
const scoreValue = (value) => value === "" || value === undefined || value === null ? null : Number(value);

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
    const payload = { shop_id: req.user.shop_id, class_id, term, academic_year: year, exam_date: exam_date || null, max_score: 200, name: clean(name) || `${schoolClass.name} - ${term.replace("_", " ")}` };
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
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id,term,academic_year,max_score,school_classes(name,level,grade)").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Term record not found." });
    const { data, error } = await supabase.from("school_exam_results").select("id,student_id,subject,score,attempt_one,attempt_two,school_students(name,registration_no)").eq("exam_id", exam.id).eq("shop_id", req.user.shop_id).order("subject");
    if (error) throw error;
    res.json({ exam, data: data || [] });
  } catch (error) { next(error); }
};

const saveExamResults = async (req, res, next) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ message: "results must be an array." });
    const { data: exam, error: examError } = await supabase.from("school_exams").select("id,class_id").eq("id", req.params.id).eq("shop_id", req.user.shop_id).maybeSingle();
    if (examError) throw examError;
    if (!exam) return res.status(404).json({ message: "Term record not found." });
    const ids = [...new Set(results.map((r) => r.student_id).filter(Boolean))];
    if (ids.length) {
      const { data: students, error } = await supabase.from("school_students").select("id,class_id").eq("shop_id", req.user.shop_id).in("id", ids);
      if (error) throw error;
      const valid = new Map((students || []).map((s) => [s.id, s]));
      for (const result of results) {
        const student = valid.get(result.student_id);
        const one = scoreValue(result.attempt_one);
        const two = scoreValue(result.attempt_two);
        if (!student) return res.status(400).json({ message: "A student does not belong to this school." });
        if (exam.class_id && student.class_id !== exam.class_id) return res.status(400).json({ message: "All results must belong to the selected class." });
        if (!result.subject || !String(result.subject).trim()) return res.status(400).json({ message: "Every score needs a subject." });
        if (one !== null && (!Number.isFinite(one) || one < 0 || one > 100)) return res.status(400).json({ message: "First assessment scores must be between 0 and 100." });
        if (two !== null && (!Number.isFinite(two) || two < 0 || two > 100)) return res.status(400).json({ message: "Second assessment scores must be between 0 and 100." });
      }
    }
    if (!results.length) return res.json({ message: "No results to save.", data: [] });
    const rows = results.map((r) => {
      const one = scoreValue(r.attempt_one) ?? 0;
      const two = scoreValue(r.attempt_two) ?? 0;
      return { shop_id: req.user.shop_id, exam_id: exam.id, student_id: r.student_id, subject: clean(r.subject), attempt_one: scoreValue(r.attempt_one), attempt_two: scoreValue(r.attempt_two), score: one + two };
    });
    const { data, error } = await supabase.from("school_exam_results").upsert(rows, { onConflict: "exam_id,student_id,subject" }).select("*");
    if (error) throw error;
    res.json({ message: "Results saved.", data });
  } catch (error) { next(error); }
};

const getSubjects = async (req, res) => res.json({ primary: ["Arabic", "Science", "Math", "Technology", "Tarbiya", "Social Studies", "Somali", "English"], secondary: ["Arabic", "Tarbiya", "History", "Geography", "Chemistry", "Biology", "Technology", "Business", "Somali", "English", "Math"] });

module.exports = { getExams, createExam, deleteExam, getExamResults, saveExamResults, getSubjects };