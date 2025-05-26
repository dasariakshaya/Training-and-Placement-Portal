const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const { Parser } = require('json2csv');

// 👀 GET /api/jobs - Students view all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ deadline: 1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// 🔐 POST /api/jobs - Admin posts job
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// 📋 GET /api/jobs/:jobId/applications - Admin views applications for a job
router.get('/:jobId/applications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', '-password');
    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// 📁 GET /api/jobs/:jobId/export - Admin downloads CSV
router.get('/:jobId/export', authenticateToken, isAdmin, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId }).populate('studentId', '-password');
    const data = applications.map(app => ({
      name: app.studentId.name,
      email: app.studentId.email,
      rollNumber: app.studentId.rollNumber,
      branch: app.studentId.branch,
      appliedAt: app.appliedAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);
    res.attachment(`applications-${req.params.jobId}.csv`).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// 🗑️ DELETE /api/jobs/:jobId - Admin deletes job and its applications
router.delete('/:jobId', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Application.deleteMany({ jobId: req.params.jobId });
    await Job.findByIdAndDelete(req.params.jobId);
    res.status(200).json({ message: 'Job and related applications deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
