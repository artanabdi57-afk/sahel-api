const { supabaseAdmin: supabase } = require("../config/supabase");

async function getStudentExamHistory(req, res, next) {
  try {
    const { data: student, error: studentError } = await supabase
      .from("school_students")
      .select("id,name,registration_no,class_id,school_classes(name,level,grade)")
      .eq("id", req.params.id)
      .eq("shop_id", req.user.shop_id)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student) return res.status(404).json({ message: "Student not found." });

    const { data, error } = await supabase
      .from("school_exam_results")
      .select("subject,score,school_exams(id,name,term,academic_year,exam_date)")
      .eq("student_id", student.id)
      .eq("shop_id", req.user.shop_id);
    if (error) throw error;

    res.json({ student, data: data || [] });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStudentExamHistory };
