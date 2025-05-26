const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const isRecruiter = require('../middleware/isRecruiter');

// GET /api/recruiter/dashboard
router.get('/', isRecruiter, async (req, res) => {
  try {
    const recruiterId = req.recruiter.id;

    // Fetch all jobs posted by the recruiter
    const jobs = await Job.find({ recruiterId });
    const now = new Date();

    let openJobs = 0;
    let closedJobs = 0;

    jobs.forEach(job => {
      const isDeadlinePassed = new Date(job.deadline) < now;
      const isManuallyClosed = job.status === 'closed';

      if (isDeadlinePassed || isManuallyClosed) {
        closedJobs++;
      } else {
        openJobs++;
      }
    });

    const totalJobs = jobs.length;
    const jobIds = jobs.map(job => job._id);

    // Fetch all applications for recruiter's jobs
    const applications = await Application.find({ jobId: { $in: jobIds } });

    const totalApplications = applications.length;
    const interviewScheduled = applications.filter(app => app.interviewDate).length;

    // Breakdown of application statuses
    const statusCount = {};
    applications.forEach(app => {
      const status = app.status || 'applied';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    res.json({
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      interviewScheduled,
      applicationStatusBreakdown: statusCount
    });
  } catch (err) {
    console.error('❌ Recruiter Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
