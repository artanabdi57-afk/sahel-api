const { supabaseAdmin: supabase } = require("../config/supabase");

const clean = (value) => typeof value === "string" ? value.trim() : value;
const numberOrZero = (value) => value === "" || value === undefined || value === null ? 0 : Number(value);

const guardianPatch = (guardianType, guardianName) => {
  const name = clean(guardianName) || null;
  return {
    father_name: guardianType === "father" ? name : null,
    mother_name: guardianType === "mother" ? name : null,
    guardian_name: guardianType === "other" ? name : null,
  };
};

async function createBulkStudents(req, res, next) {
  try {
    const rows = Array.isArray(req.body?.students) ? req.body.students : [];
    const forcedClassId = clean(req.body?.class_id) || null;
    if (!rows.length) return res.status(400).json({ message: "No students were provided." });

    if (forcedClassId) {
      const { data: schoolClass, error } = await supabase
        .from("school_classes")
        .select("id,name")
        .eq("id", forcedClassId)
        .eq("shop_id", req.user.shop_id)
        .maybeSingle();
      if (error) throw error;
      if (!schoolClass) return res.status(400).json({ message: "The selected class does not belong to this school." });
    }

    const results = [];
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || {};
      const classId = forcedClassId || clean(row.class_id) || null;
      const guardianType = String(row.guardian_type || "").trim().toLowerCase();
      const guardianName = clean(row.guardian_name);
      const name = clean(row.name);
      const age = row.age === "" || row.age === undefined || row.age === null ? null : Number(row.age);

      try {
        if (!name) throw new Error("Student name is required.");
        if (!["father", "mother", "other"].includes(guardianType)) throw new Error("Choose Father, Mother, or Other guardian.");
        if (!guardianName) throw new Error("Guardian name is required.");
        if (age !== null && (!Number.isInteger(age) || age < 1 || age > 100)) throw new Error("Age must be a valid number between 1 and 100.");

        if (classId) {
          const { data: schoolClass, error } = await supabase.from("school_classes").select("id").eq("id", classId).eq("shop_id", req.user.shop_id).maybeSingle();
          if (error) throw error;
          if (!schoolClass) throw new Error("Class does not belong to this school.");
        }

        const payload = {
          shop_id: req.user.shop_id,
          registration_no: null,
          name,
          class_id: classId,
          ...guardianPatch(guardianType, guardianName),
          phone_number: clean(row.phone_number || row.guardian_phone) || null,
          guardian_phone: clean(row.phone_number || row.guardian_phone) || null,
          age,
          monthly_fee: numberOrZero(row.monthly_fee),
          status: "active",
        };

        const { data, error } = await supabase.from("school_students").insert(payload).select("*, school_classes(name,level,grade)").single();
        if (error) throw error;
        results.push({ row: index + 1, success: true, data });
      } catch (error) {
        results.push({ row: index + 1, success: false, error: error.message || "Could not save student." });
      }
    }

    const saved = results.filter((r) => r.success).length;
    const failed = results.length - saved;
    return res.status(failed ? 207 : 201).json({
      message: `${saved} students saved successfully.${failed ? ` ${failed} students could not be saved.` : ""}`,
      saved,
      failed,
      results,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBulkStudents };
