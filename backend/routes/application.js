// routes/studentApplications.js
const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const Student = require('../models/Student');
const Job = require('../models/job');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @route   POST /api/students/apply/:jobId
 * @desc    Apply to a job
 * @access  Protected (student only)
 */
router.post('/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const studentId = req.user.id;

    console.log("📨 Apply attempt by student:", studentId, "for job:", jobId);

    const student = await Student.findById(studentId);
    const job = await Job.findById(jobId);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Optional: Check profile completeness here if you want
    const alreadyApplied = await Application.findOne({ studentId, jobId });
    if (alreadyApplied) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }

    const application = new Application({
      studentId,
      jobId,
      status: 'applied', // ✅ FIXED: Must match enum in model
      appliedAt: new Date()
    });

    await application.save();

    console.log(`✅ ${student.name} successfully applied to ${job.title}`);
    res.status(201).json({ message: 'Application submitted successfully' });

  } catch (err) {
    console.error('❌ Application error:', err.message);
    res.status(500).json({ error: 'Application failed' });
  }
});

module.exports = router;
