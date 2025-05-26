const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin'); // ✅ Fix: added import
const Student = require('../models/Student');
const Application = require('../models/application');
const Job = require('../models/job');

// ✅ GET /api/student/me - View own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id, '-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

// ✅ PATCH /api/student/mark-placed/:id - Admin marks student as placed
router.patch('/mark-placed/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { placed: true });
    res.status(200).json({ message: 'Student marked as placed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update placement status' });
  }
});

// ✅ GET /api/student/applications - View jobs student applied to
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ studentId: req.user.id }).populate('jobId');

    if (apps.length === 0) {
      return res.status(200).json({ message: 'No applications found yet.', jobs: [] });
    }

    const jobList = apps.map(app => ({
      jobId: app.jobId._id,
      title: app.jobId.title,
      company: app.jobId.company,
      deadline: app.jobId.deadline,
      appliedAt: app.appliedAt
    }));

    res.json(jobList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
