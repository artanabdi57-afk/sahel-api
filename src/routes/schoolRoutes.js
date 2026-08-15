const express = require("express");
const {
  getClasses, createClass, deleteClass,
  getStudents, createStudent, updateStudent, deleteStudent,
  getTeachers, createTeacher, updateTeacher, deleteTeacher,
  getFeePayments, getUnpaidFees, createFeePayment,
  getSalaryPayments, getUnpaidSalaries, createSalaryPayment,
} = require("../controllers/schoolController");
const { getExams, createExam, deleteExam, getExamResults, saveExamResults, getSubjects } = require("../controllers/schoolExamController");
const { getStudentExamHistory } = require("../controllers/studentExamHistoryController");
const { getAttendance, saveAttendance, getAttendanceHistory } = require("../controllers/schoolAttendanceController");

const router = express.Router();
router.get("/classes", getClasses);
router.post("/classes", createClass);
router.delete("/classes/:id", deleteClass);
router.get("/students", getStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.get("/teachers", getTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.get("/fee-payments", getFeePayments);
router.get("/fee-payments/unpaid", getUnpaidFees);
router.post("/fee-payments", createFeePayment);
router.get("/salary-payments", getSalaryPayments);
router.get("/salary-payments/unpaid", getUnpaidSalaries);
router.post("/salary-payments", createSalaryPayment);
router.get("/subjects", getSubjects);
router.get("/students/:id/exam-history", getStudentExamHistory);
router.get("/exams", getExams);
router.post("/exams", createExam);
router.delete("/exams/:id", deleteExam);
router.get("/exams/:id/results", getExamResults);
router.post("/exams/:id/results", saveExamResults);
router.get("/attendance", getAttendance);
router.post("/attendance", saveAttendance);
router.get("/attendance/history", getAttendanceHistory);
module.exports = router;
