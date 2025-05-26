// routes/student.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Application = require('../models/application');
const Job = require('../models/job');
const authenticateToken = require('../middleware/authMiddleware');

// ✅ GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error('❌ Error fetching all students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ✅ GET current student profile (via token)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error('❌ Error fetching student profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ✅ POST /api/students/apply/:jobId — Apply to a job
router.post('/apply/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const studentId = req.user.id;

    console.log("📨 Apply route hit");
    console.log("👤 Student ID from token:", studentId);
    console.log("🧾 Job ID from URL:", jobId);

    const student = await Student.findById(studentId);
    const job = await Job.findById(jobId);

    console.log("🎓 Student found:", !!student);
    console.log("🏢 Job found:", !!job);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // ✅ Profile Completion Check
    const isComplete = student.name && student.branch &&
      student.resumeLink && student.skills?.length &&
      student.education?.length && student.experience?.length;

    if (!isComplete) {
      return res.status(400).json({
        error: 'Please complete all required sections (Profile, Resume, Skills, Education, Experience) before applying.'
      });
    }

    // ✅ Duplicate Application Check
    const alreadyApplied = await Application.findOne({ studentId, jobId });
    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // ✅ Save Application
    const newApp = new Application({
      studentId,
      jobId,
      status: 'applied', // ✅ FIXED from 'pending'
      appliedAt: new Date()
    });

    await newApp.save();

    console.log(`✅ ${student.name} successfully applied to ${job.title}`);
    res.status(200).json({ message: 'Application submitted successfully' });

  } catch (err) {
    console.error('❌ Apply Error:', err.message);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});

// ✅ GET /api/students/:id — Public view of student profile
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error('❌ Error fetching student by ID:', err);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
});

module.exports = router;
