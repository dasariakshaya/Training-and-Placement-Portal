// routes/recruiterJobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const Recruiter = require('../models/recruiter');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// All routes in this file are for recruiters
router.use(authenticateToken, authorize(['recruiter']));

// GET /api/recruiters/dashboard - Get dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const jobs = await Job.find({ recruiterId });
        const jobIds = jobs.map(job => job._id);
        const applications = await Application.find({ jobId: { $in: jobIds } });

        const totalJobs = jobs.length;
        const openJobs = jobs.filter(job => job.status === 'open').length;

        res.json({
            totalJobs,
            openJobs,
            closedJobs: totalJobs - openJobs,
            totalApplications: applications.length
        });
    } catch (err) {
        console.error('❌ Recruiter Dashboard Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data.' });
    }
});

// POST /api/recruiters/jobs - Post a new job
router.post('/jobs', async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.user.id);
        const job = new Job({ ...req.body, recruiterId: req.user.id, company: recruiter.company });
        await job.save();
        res.status(201).json({ message: 'Job posted successfully.', job });
    } catch (err) {
        console.error('❌ Job post error:', err);
        res.status(500).json({ error: 'Failed to post job.' });
    }
});

// GET /api/recruiters/jobs - Get all jobs posted by the recruiter
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error('❌ Error fetching recruiter jobs:', err);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

// GET /api/recruiters/jobs/:jobId/applications - Get applicants for a specific job
router.get('/jobs/:jobId/applications', async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('studentId', 'name email resumeLink');
        res.json(applications);
    } catch (err) {
        console.error('❌ Error fetching applicants:', err);
        res.status(500).json({ error: 'Failed to fetch applicants.' });
    }
});

// PATCH /api/recruiters/applications/:appId/status - Update application status
router.patch('/applications/:appId/status', async (req, res) => {
    const { status, interviewDate } = req.body;
    try {
        const update = { status };
        if (interviewDate) update.interviewDate = interviewDate;

        const application = await Application.findByIdAndUpdate(req.params.appId, update, { new: true });
        if (!application) return res.status(404).json({ error: 'Application not found.' });

        res.json({ message: 'Application status updated.', application });
    } catch (err) {
        console.error('❌ Error updating status:', err);
        res.status(500).json({ error: 'Failed to update application.' });
    }
});


module.exports = router;