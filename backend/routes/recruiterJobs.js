// routes/recruiterJobs.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Job = require('../models/job');
const Application = require('../models/application');
const Recruiter = require('../models/recruiter');
const Student = require('../models/Student');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/job_pdfs/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}-${Date.now()}`;
    cb(null, `job-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Apply middleware to all routes in this file
router.use(authenticateToken, authorize(['recruiter']));

// POST /api/recruiter/jobs - Post a new job
router.post('/jobs', upload.single('jobDescriptionPdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Job description PDF is required.' });
        }
        const recruiter = await Recruiter.findById(req.user.id);
        const pdfUrl = `/uploads/job_pdfs/${req.file.filename}`;

        const job = new Job({
            ...req.body,
            recruiterId: req.user.id,
            company: recruiter.company,
            jobDescriptionPdfUrl: pdfUrl
        });
        
        await job.save();
        res.status(201).json({ message: 'Job posted successfully.', job });
    } catch (err) {
        console.error('❌ Job post error:', err);
        res.status(500).json({ error: 'Failed to post job.' });
    }
});

// GET /api/recruiter/jobs/my-jobs - Get all jobs posted by the recruiter
router.get('/jobs/my-jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user.id }).sort({ postedAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error('❌ Error fetching recruiter jobs:', err);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

// GET /api/recruiter/jobs/:jobId/applications - Get applicants for a specific job
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

// PATCH /api/recruiter/applications/:appId/status - Update application status
router.patch('/applications/:appId/status', async (req, res) => {
    // ✅ MODIFIED: Destructure the new 'meetingLink' from the request body
    const { status: frontendStatus, interviewDate, role, meetingLink } = req.body; 
    
    try {
        const application = await Application.findById(req.params.appId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        const job = await Job.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ error: 'Associated job not found.' });
        }

        let applicationStatus;
        let studentStatus;

        switch (frontendStatus) {
            case 'shortlisted':
                applicationStatus = 'interview';
                studentStatus = 'Shortlisted';
                break;
            case 'hired':
                applicationStatus = 'selected';
                studentStatus = 'Hired'; 
                break;
            case 'applied':
                applicationStatus = 'applied';
                studentStatus = 'Applied';
                break;
            case 'rejected':
                applicationStatus = 'rejected';
                studentStatus = 'Rejected';
                break;
            default:
                return res.status(400).json({ error: 'Invalid status value.' });
        }

        application.status = applicationStatus; 
        application.interviewDate = interviewDate || null;
        application.meetingLink = meetingLink || null; // ✅ ADDED: Save the meeting link
        await application.save();

        const studentUpdatePayload = {
            placementDetails: {
                company: job.company,
                status: studentStatus,
                role: role || null
            }
        };

        if (frontendStatus === 'hired') {
            if (!role) {
                return res.status(400).json({ error: "A job role is required to mark a student as 'hired'." });
            }
            studentUpdatePayload.placementDetails.role = role;
        }
        
        await Student.findByIdAndUpdate(application.studentId, studentUpdatePayload);
        
        res.json({ message: 'Application and student status updated successfully.' });

    } catch (err) {
        console.error('❌ Error updating status:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to update application.' });
    }
});

// GET /api/recruiter/profile - Fetch recruiter's profile details
router.get('/profile', async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id).select('-password');
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter profile not found.' });
    }
    res.json(recruiter);
  } catch (err) {
    console.error('❌ Error fetching recruiter profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/recruiter/profile - Update recruiter's profile details
router.patch('/profile', async (req, res) => {
  const { name, company } = req.body;
  try {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.user.id,
      { contactPerson: name, company: company },
      { new: true }
    ).select('-password');
    
    if (!updatedRecruiter) {
      return res.status(404).json({ error: 'Recruiter not found.' });
    }
    res.json({ message: 'Profile updated successfully.', recruiter: updatedRecruiter });
  } catch (err) {
    console.error('❌ Error updating recruiter profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PATCH /api/recruiter/password - Change recruiter's password
router.patch('/password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, recruiter.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    recruiter.password = hashedPassword;
    await recruiter.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('❌ Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ✅ FIXED: Only one module.exports at the end of the file
module.exports = router;