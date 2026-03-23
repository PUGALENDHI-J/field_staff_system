const express = require('express');
const router = express.Router();
const { getAllAttendance } = require('../../controllers/attendanceController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getAllAttendance);

module.exports = router;
