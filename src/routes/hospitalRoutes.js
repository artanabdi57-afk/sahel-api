const express = require("express");
const {
  getDashboard,
  getPatients, createPatient, updatePatient, deletePatient,
  getDepartments,
  getStaff, createStaff, updateStaff, deleteStaff,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getMedicines, createMedicine, updateMedicine, deleteMedicine,
  getLabRequests, createLabRequest, updateLabRequest,
  getBills, createBill, updateBill,
  getDevices, createDevice, updateDevice,
} = require("../controllers/hospitalController");
const { getManagementDashboard, createHospitalStaff } = require("../controllers/hospitalManagementController");

const router = express.Router();
router.get("/dashboard", getManagementDashboard);
router.get("/patients", getPatients); router.post("/patients", createPatient); router.put("/patients/:id", updatePatient); router.delete("/patients/:id", deletePatient);
router.get("/departments", getDepartments);
router.get("/staff", getStaff); router.post("/staff", createHospitalStaff); router.put("/staff/:id", updateStaff); router.delete("/staff/:id", deleteStaff);
router.get("/appointments", getAppointments); router.post("/appointments", createAppointment); router.put("/appointments/:id", updateAppointment); router.delete("/appointments/:id", deleteAppointment);
router.get("/pharmacy", getMedicines); router.post("/pharmacy", createMedicine); router.put("/pharmacy/:id", updateMedicine); router.delete("/pharmacy/:id", deleteMedicine);
router.get("/laboratory", getLabRequests); router.post("/laboratory", createLabRequest); router.put("/laboratory/:id", updateLabRequest);
router.get("/billing", getBills); router.post("/billing", createBill); router.put("/billing/:id", updateBill);
router.get("/devices", getDevices); router.post("/devices", createDevice); router.put("/devices/:id", updateDevice);
module.exports = router;
