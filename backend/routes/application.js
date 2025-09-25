// routes/application.js
const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const Student = require('../models/Student');
const Job = require('../models/job');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize'); // ✅ Import authorize

// POST /api/applications/:jobId - Apply to a job
router.post('/:jobId', authenticateToken, authorize(['student']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;

    const [student, job, alreadyApplied] = await Promise.all([
        Student.findById(studentId),
        Job.findById(jobId),
        Application.findOne({ studentId, jobId })
    ]);

    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    if (!job) return res.status(404).json({ error: 'Job opening not found or has been closed.' });
    if (alreadyApplied) return res.status(409).json({ error: 'You have already applied to this job.' });
    if (student.placed) return res.status(403).json({ error: 'Placed students cannot apply for new jobs.' });

    const application = new Application({ studentId, jobId });
    await application.save();

    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('❌ Application error:', err.message);
    res.status(500).json({ error: 'Server error during application.' });
  }
});

module.exports = router;