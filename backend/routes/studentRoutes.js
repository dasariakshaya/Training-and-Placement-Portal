// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Application = require('../models/application');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// All routes here are for authenticated students
router.use(authenticateToken, authorize(['student', 'verifier'])); // Allows both roles to access their profile

// GET /api/students/me - Get the logged-in student's profile
router.get('/me', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    res.json(student);
  } catch (err) {
    console.error('❌ Error fetching student profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// GET /api/students/applications - Get all applications for the logged-in student
router.get('/applications', async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.id })
            .populate('jobId', 'title company deadline status');
            
        res.json(applications);
    } catch (err) {
        console.error('❌ Error fetching student applications:', err);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// PATCH /api/students/me/profile - Update basic profile info
router.patch('/me/profile', async (req, res) => {
    try {
        const { name, branch, socialLinks, skills, education, projects, experience, achievements } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { name, branch, socialLinks, skills, education, projects, experience, achievements },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) return res.status(404).json({ error: 'Student not found.' });
        res.json({ message: 'Profile updated successfully.', student });
    } catch (err) {
        console.error('❌ Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

module.exports = router;