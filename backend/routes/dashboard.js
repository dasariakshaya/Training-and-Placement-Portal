const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const Student = require('../models/Student');
const Application = require('../models/application');
const Job = require('../models/job');

router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const placed = await Student.countDocuments({ placed: true });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();

  res.json({ totalStudents, placed, totalJobs, totalApplications });
});

module.exports = router;
