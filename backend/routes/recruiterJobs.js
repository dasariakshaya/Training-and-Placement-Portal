const express = require('express');
const router = express.Router();
const path = require('path');
const { Parser } = require('json2csv');

const Job = require('../models/job');
const Application = require('../models/application');
const Student = require('../models/Student');
const Recruiter = require('../models/recruiter');
const isRecruiter = require('../middleware/isRecruiter');

// ==============================
// ✅ POST a job
// ==============================
router.post('/', isRecruiter, async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.recruiter.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter not found' });

    const job = new Job({
      ...req.body,
      recruiterId: recruiter._id,
      company: recruiter.company,
      status: 'open'
    });

    await job.save();
    res.status(201).json({ message: 'Job posted', job });
  } catch (err) {
    console.error('❌ Job post error:', err);
    res.status(500).json({ error: 'Job post failed' });
  }
});

// ==============================
// ✅ GET all jobs by recruiter (with applicants)
// ==============================
router.get('/my-jobs', isRecruiter, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.recruiter.id });

    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applications = await Application.find({ jobId: job._id })
          .populate('studentId', 'name email resumeLink');

        const applicants = applications.map((app) => ({
          id: app._id,
          name: app.studentId?.name || 'Unknown',
          email: app.studentId?.email || 'Unknown',
          studentId: app.studentId?._id || null,
          resume: app.studentId?.resumeLink || null,
          status: app.status || 'applied',
          appliedAt: app.appliedAt,
          interviewDate: app.interviewDate || null
        }));

        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          status: job.status,
          applicants
        };
      })
    );

    res.json(jobsWithApplicants);
  } catch (err) {
    console.error('❌ Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter jobs' });
  }
});

// ==============================
// ✅ GET applicants for a specific job
// ==============================
router.get('/applicants/:jobId', isRecruiter, async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', 'name email resumeLink');

    const response = apps.map((app) => ({
      id: app._id,
      studentId: app.studentId?._id || null,
      name: app.studentId?.name || 'Unknown',
      email: app.studentId?.email || 'Unknown',
      resume: app.studentId?.resumeLink || null,
      appliedAt: app.appliedAt,
      status: app.status,
      interviewDate: app.interviewDate || null
    }));

    res.json(response);
  } catch (err) {
    console.error('❌ Error fetching applicants:', err);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// ==============================
// ✅ PATCH - Update applicant status
// ==============================
router.patch('/update-status/:applicationId', isRecruiter, async (req, res) => {
  const { status } = req.body;
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });

    res.json({ message: 'Status updated', application });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ==============================
// ✅ PATCH - Schedule interview
// ==============================
router.patch('/schedule/:applicationId', isRecruiter, async (req, res) => {
  const { interviewDate } = req.body;
  if (!interviewDate) return res.status(400).json({ error: 'Interview date is required' });

  try {
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      {
        interviewDate: new Date(interviewDate),
        status: 'interview'
      },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });

    res.json({ message: 'Interview scheduled', application });
  } catch (err) {
    console.error('❌ Error scheduling interview:', err);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

// ==============================
// ✅ DELETE - Remove a job
// ==============================
router.delete('/:jobId', isRecruiter, async (req, res) => {
  try {
    const deleted = await Job.findOneAndDelete({
      _id: req.params.jobId,
      recruiterId: req.recruiter.id
    });

    if (!deleted) return res.status(404).json({ error: 'Job not found or unauthorized' });

    await Application.deleteMany({ jobId: req.params.jobId });

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ==============================
// ✅ GET - Export applicants as CSV
// ==============================
router.get('/export/:jobId', isRecruiter, async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId }).populate('studentId');

    const data = apps.map(app => ({
      name: app.studentId?.name || '',
      email: app.studentId?.email || '',
      rollNumber: app.studentId?.rollNumber || '',
      branch: app.studentId?.branch || '',
      appliedAt: app.appliedAt,
      interviewDate: app.interviewDate || '',
      status: app.status
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.attachment('applicants.csv').send(csv);
  } catch (err) {
    console.error('❌ Error exporting CSV:', err);
    res.status(500).json({ error: 'Failed to export applicants' });
  }
});

// ==============================
// ✅ GET - Download student resume
// ==============================
router.get('/resume/:studentId', isRecruiter, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.resumeLink) {
      return res.status(404).json({ error: 'No resume found' });
    }

    // Construct full file system path
    const resumePath = path.join(__dirname, '..', student.resumeLink.replace(/^\/+/, ''));

    // Check if the file actually exists
    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ error: 'Resume file missing on server' });
    }

    // Download the resume file
    res.download(resumePath);
  } catch (err) {
    console.error('❌ Error fetching resume:', err);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

module.exports = router;
