// routes/studentRoutes.js
const express = require('express');
const router = express.Router();

// --- MODEL & MIDDLEWARE IMPORTS ---
const Student = require('../models/Student');
const Application = require('../models/application');
const Job = require('../models/job');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// ===================================
//  STUDENT-SPECIFIC ROUTES (Requires Login)
// ===================================

// GET /api/students/me - View own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// GET /api/students/applications - View jobs student has applied to
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title company deadline');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// POST /api/students/apply/:jobId — Apply to a job
router.post('/apply/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!student.resumeLink || student.skills.length === 0 || student.education.length === 0) {
      return res.status(400).json({ error: 'Please complete your Resume, Skills, and Education sections before applying.' });
    }
    if (await Application.findOne({ studentId, jobId })) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    const newApplication = new Application({ studentId, jobId, appliedAt: new Date() });
    await newApplication.save();
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});


// --- PROFILE UPDATE ROUTES ---
router.patch('/me/profile', authenticateToken, async (req, res) => {
  try {
    const { name, branch } = req.body;
    await Student.findByIdAndUpdate(req.user.id, { name, branch });
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});
// ... (other /me/ routes are correct)
router.patch('/me/skills', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.body;
    await Student.findByIdAndUpdate(req.user.id, { $push: { skills: skill } });
    res.status(200).json({ message: 'Skill added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add skill' });
  }
});
router.patch('/me/experience', authenticateToken, async (req, res) => {
  try {
    const { title, company, duration, description } = req.body;
    await Student.findByIdAndUpdate(req.user.id, { $push: { experience: { title, company, duration, description } } });
    res.status(200).json({ message: 'Experience added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});
router.patch('/me/education', authenticateToken, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, { $push: { education: req.body } });
    res.status(200).json({ message: 'Education added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add education' });
  }
});
router.patch('/me/projects', authenticateToken, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, { $push: { projects: req.body } });
    res.status(200).json({ message: 'Project added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});
router.patch('/me/achievements', authenticateToken, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, { $push: { achievements: req.body } });
    res.status(200).json({ message: 'Achievement added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});
router.patch('/me/social-links', authenticateToken, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, { $push: { socialLinks: req.body } });
    res.status(200).json({ message: 'Social link added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add social link' });
  }
});

// ===================================
//  PUBLIC & GENERAL ROUTES
// ===================================
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ✅ MODIFIED: Added authenticateToken middleware
router.get('/:id', authenticateToken, async (req, res) => {
    // Security check: ensure the logged-in user is requesting their own profile
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own profile.' });
    }
    
    try {
        const student = await Student.findById(req.params.id).select('-password').lean();
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const applications = await Application.find({ studentId: req.params.id }).lean();
        student.applications = applications;
        
        res.json(student);
    } catch (err) {
        console.error('❌ Error fetching student profile with applications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===================================
//  ADMIN ROUTES
// ===================================
router.patch('/mark-placed/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { placed: true }, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json({ message: 'Student marked as placed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update placement status' });
  }
});

module.exports = router;