// routes/job.js
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { Parser } = require('json2csv');

// PUBLIC ROUTE - Get all jobs (accessible to everyone)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ deadline: 1 });
    res.json(jobs);
  } catch (err) {
    console.error('❌ Failed to fetch jobs:', err);
    res.status(500).json({ error: 'Server error fetching jobs.' });
  }
});

// ADMIN ONLY - Post a new job
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    console.error('❌ Failed to post job:', err);
    res.status(500).json({ error: 'Server error posting job.' });
  }
});

// ADMIN ONLY - View applications for a specific job
router.get('/:jobId/applications', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', 'name email rollNumber branch'); // More secure projection
    res.json(applications);
  } catch (err) {
    console.error('❌ Failed to fetch applications:', err);
    res.status(500).json({ error: 'Server error fetching applications.' });
  }
});

// ADMIN ONLY - Export applications to CSV
router.get('/:jobId/export', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.jobId }).populate('studentId', '-password');
        const data = applications.map(app => ({
            name: app.studentId.name,
            email: app.studentId.email,
            rollNumber: app.studentId.rollNumber,
            branch: app.studentId.branch,
            appliedAt: app.appliedAt.toISOString()
        }));

        if (data.length === 0) {
            return res.status(404).json({ error: 'No applications found to export.' });
        }

        const parser = new Parser();
        const csv = parser.parse(data);
        res.header('Content-Type', 'text/csv');
        res.attachment(`applications-${req.params.jobId}.csv`).send(csv);
    } catch (err) {
        console.error('❌ Failed to export CSV:', err);
        res.status(500).json({ error: 'Server error during CSV export.' });
    }
});


// ADMIN ONLY - Delete a job and its related applications
router.delete('/:jobId', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const jobToDelete = await Job.findById(req.params.jobId);
    if (!jobToDelete) {
        return res.status(404).json({ error: 'Job not found.' });
    }
    await Application.deleteMany({ jobId: req.params.jobId });
    await Job.findByIdAndDelete(req.params.jobId);
    res.json({ message: 'Job and all related applications have been deleted.' });
  } catch (err) {
    console.error('❌ Failed to delete job:', err);
    res.status(500).json({ error: 'Server error deleting job.' });
  }
});

module.exports = router;