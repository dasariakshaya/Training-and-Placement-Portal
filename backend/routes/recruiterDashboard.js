// routes/recruiterDashboard.js
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authenticateToken, authorize(['recruiter']));

// GET /api/recruiter/dashboard - The single endpoint for all dashboard data
router.get('/', async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // 1. Fetch all jobs posted by the recruiter
    const jobs = await Job.find({ recruiterId });
    const jobIds = jobs.map(job => job._id);

    // 2. Fetch all applications for those jobs
    let applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('studentId', 'name')
      .sort({ appliedAt: -1 });

    // Filter out any applications with broken student references
    applications = applications.filter(app => app.studentId);

    // 3. Calculate all necessary stats
    const now = new Date();
    const openJobs = jobs.filter(j => j.status === 'open' && new Date(j.deadline) >= now).length;
    const closedJobs = jobs.length - openJobs;

    // ✅ MODIFIED: Calculate stats using the CORRECT status names ('interview', 'selected')
    const statusCounts = { shortlisted: 0, hired: 0, rejected: 0 };
    applications.forEach(app => {
        if (app.status === 'interview') {
            statusCounts.shortlisted++;
        } else if (app.status === 'selected') {
            statusCounts.hired++;
        } else if (app.status === 'rejected') {
            statusCounts.rejected++;
        }
    });

    const upcomingInterviews = applications
      .filter(app => app.status === 'interview' && app.interviewDate && new Date(app.interviewDate) >= now)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, 5);

    const recentApplicants = applications.slice(0, 5);

    // 4. Return a single, comprehensive data object
    res.json({
      jobSummary: {
        open: openJobs,
        closed: closedJobs,
      },
      overview: {
        totalApplicants: applications.length,
        shortlisted: statusCounts.shortlisted,
        hired: statusCounts.hired,
        rejected: statusCounts.rejected,
      },
      upcomingInterviews,
      recentApplicants,
    });

  } catch (err) {
    console.error('❌ Recruiter Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;