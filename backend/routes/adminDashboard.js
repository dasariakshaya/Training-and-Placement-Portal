const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Job = require('../models/job');
const Application = require('../models/application');
const isAdmin = require('../middleware/isAdmin');

// 📊 Dashboard summary
router.get('/overview', isAdmin, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalPlaced = await Student.countDocuments({ placed: true });

    const recentPlacements = await Student.find({ placed: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name updatedAt');

    const recentFormatted = recentPlacements.map(p => ({
      name: p.name,
      year: new Date(p.updatedAt).getFullYear()
    }));

    res.json({
      totalStudents,
      totalApplications,
      totalJobs,
      totalPlaced,
      recentPlacements: recentFormatted
    });
  } catch (err) {
    console.error("❌ Admin dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// 🔄 Mark placed / verified
router.patch('/mark-placed/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { placed: true }, { new: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student marked as placed", student });
  } catch (err) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

router.patch('/mark-verified/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student marked as verified", student });
  } catch (err) {
    res.status(500).json({ error: "Failed to update verification" });
  }
});

// 🔍 Search
router.get('/search-students', isAdmin, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);
    const regex = new RegExp(query, 'i');
    const students = await Student.find({
      $or: [{ name: regex }, { email: regex }]
    }).select('name email placed');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 📄 Post Job
router.post('/post-job', isAdmin, async (req, res) => {
  const { title, company, location, description, deadline } = req.body;
  try {
    const job = new Job({
      title,
      company,
      location,
      description,
      deadline,
      status: 'open',
      postedBy: 'admin'
    });
    await job.save();
    res.status(201).json({ message: "Job posted by admin", job });
  } catch (err) {
    res.status(500).json({ error: "Failed to post job" });
  }
});

// ✅ View applications with full population
router.get('/applications', isAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({ path: 'studentId', select: 'name email resumeLink' })
      .populate({ path: 'jobId', select: 'title company' });

    const result = applications.map(app => ({
      id: app._id,
      name: app.studentId?.name || 'Unknown',
      email: app.studentId?.email || 'Unknown',
      resume: app.studentId?.resumeLink ? `http://localhost:3000${app.studentId.resumeLink}` : null,
      jobTitle: app.jobId?.title || 'Unknown',
      company: app.jobId?.company || 'Unknown',
      appliedAt: app.appliedAt,
      status: app.status || 'applied',
      interviewDate: app.interviewDate || null
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Application fetch error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ✅ Get all students (for Mark Placed Page)
router.get('/all-students', isAdmin, async (req, res) => {
  try {
    const students = await Student.find({}, 'name email branch placed verified placedCompany');
    res.json(students);
  } catch (err) {
    console.error("❌ Failed to fetch all students:", err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ✅ PATCH: Mark a student as placed (optionally with placedCompany)
router.patch('/mark-placed/:id', isAdmin, async (req, res) => {
  try {
    const update = { placed: true };
    if (req.body.placedCompany) update.placedCompany = req.body.placedCompany;

    const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student marked as placed", student });
  } catch (err) {
    console.error("❌ Failed to mark student as placed:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// ✅ PATCH: Mark a student as verified
router.patch('/mark-verified/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student marked as verified", student });
  } catch (err) {
    console.error("❌ Failed to verify student:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});
router.patch('/mark-placed/:id', isAdmin, async (req, res) => {
  try {
    const { placed, placedCompany } = req.body;

    if (!placedCompany || placedCompany.trim() === '') {
      return res.status(400).json({ error: "Company name is required" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { placed, placedCompany },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student marked as placed", student });
  } catch (err) {
    console.error("❌ Failed to mark student placed:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});
module.exports = router;
