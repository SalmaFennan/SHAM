const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/dashboard', attendanceController.getDashboardData);
router.post('/checkin/:employeeId', attendanceController.checkIn);
router.post('/checkout/:employeeId', attendanceController.checkOut);
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);

module.exports = router;