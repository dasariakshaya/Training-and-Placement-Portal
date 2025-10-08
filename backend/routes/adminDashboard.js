// routes/adminDashboard.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Job = require('../models/job');
const Application = require('../models/application');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// All routes in this file are for admins
router.use(authenticateToken, authorize(['admin']));

// GET /api/admin/overview - Dashboard summary stats
router.get('/overview', async (req, res) => {
  try {
    const [totalStudents, totalApplications, totalJobs, totalPlaced] = await Promise.all([
      Student.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments(),
      Student.countDocuments({ placed: true })
    ]);

    res.json({ totalStudents, totalApplications, totalJobs, totalPlaced });
  } catch (err) {
    console.error("❌ Admin dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

// GET /api/admin/applications - Get all applications for viewing
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate({ path: 'studentId', select: 'name email resumeLink' })
      .populate({ path: 'jobId', select: 'title company' })
      .sort({ appliedAt: -1 });

    const validApplications = applications.filter(app => app.studentId && app.jobId);
    
    res.json(validApplications);
  } catch (err) {
    console.error("❌ Failed to fetch all applications:", err);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// GET /api/admin/students - Get all students for management
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({}, 'name email branch placed verified placedCompany role');
    res.json(students);
  } catch (err) {
    console.error("❌ Failed to fetch all students:", err);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// ✅ NEW: GET /api/admin/students/:id - Get a single student's profile
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(student);
  } catch (err) {
    console.error("❌ Failed to fetch student profile:", err);
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

// PATCH /api/admin/students/:id/mark-placed - Mark a student as placed
router.patch('/students/:id/mark-placed', async (req, res) => {
    const { placed, placedCompany } = req.body;
    
    if (placed && (!placedCompany || placedCompany.trim() === '')) {
      return res.status(400).json({ error: "Company name is required to mark a student as placed." });
    }

    try {
        const updateData = { placed: !!placed, placedCompany: placed ? placedCompany : "" };
        const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!student) return res.status(404).json({ error: "Student not found." });

        res.json({ message: "Student placement status updated.", student });
    } catch (err) {
        console.error("❌ Failed to update placement status:", err);
        res.status(500).json({ error: "Failed to update student." });
    }
});

// PATCH /api/admin/students/:id/mark-verified - Mark a student as verified
router.patch('/students/:id/mark-verified', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { verified: req.body.verified }, { new: true });
        if (!student) return res.status(404).json({ error: "Student not found." });
        res.json({ message: "Student verification status updated.", student });
    } catch (err) {
        console.error("❌ Failed to update verification status:", err);
        res.status(500).json({ error: "Failed to update verification status." });
    }
});

module.exports = router;