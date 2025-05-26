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

// Update Skills
router.patch('/me/skills', authenticateToken, async (req, res) => {
  try {
    const { skill } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.skills.push(skill);
    await student.save();

    res.status(200).json({ message: 'Skill added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Update Experience
router.patch('/me/experience', authenticateToken, async (req, res) => {
  try {
    const { title, company, duration, description } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.experience.push({ title, company, duration, description });
    await student.save();

    res.status(200).json({ message: 'Experience added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

// Update Education
router.patch('/me/education', authenticateToken, async (req, res) => {
  try {
    const { institute, degree, year } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.education.push({ institute, degree, year });
    await student.save();

    res.status(200).json({ message: 'Education added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add education' });
  }
});

// Update Projects
router.patch('/me/projects', authenticateToken, async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.projects.push({ title, description, link });
    await student.save();

    res.status(200).json({ message: 'Project added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// Update Achievements
router.patch('/me/achievements', authenticateToken, async (req, res) => {
  try {
    const { achievement } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.achievements.push(achievement);
    await student.save();

    res.status(200).json({ message: 'Achievement added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});

// Update Social Links
router.patch('/me/social-links', authenticateToken, async (req, res) => {
  try {
    const { links } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.socialLinks = links;
    await student.save();

    res.status(200).json({ message: 'Social links updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

module.exports = router;
