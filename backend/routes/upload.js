// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize'); // ✅ Import authorize
const Student = require('../models/Student');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_resume${ext}`); // Use user ID from authenticated token
  }
});

const upload = multer({ storage });

// POST /api/upload/resume - Student uploads their resume
router.post('/resume', authenticateToken, authorize(['student']), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });

    const filePath = `/uploads/${req.file.filename}`;
    await Student.findByIdAndUpdate(req.user.id, { resumeLink: filePath });

    res.json({ message: 'Resume uploaded successfully.', resumeLink: filePath });
  } catch (err) {
    console.error('❌ Resume upload error:', err);
    res.status(500).json({ error: 'Server error during file upload.' });
  }
});

module.exports = router;