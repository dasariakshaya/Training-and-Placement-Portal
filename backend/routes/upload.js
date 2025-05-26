const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware');
const Student = require('../models/Student');

const router = express.Router();

// Store files in /uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '_resume' + ext); // saves as <userID>_resume.pdf
  }
});

const upload = multer({ storage });

// POST /api/upload/resume
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = `/uploads/${req.file.filename}`;

    // Update resume link in student DB
    await Student.findByIdAndUpdate(req.user.id, { resumeLink: filePath });

    res.status(200).json({ message: 'Resume uploaded', resumeLink: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
