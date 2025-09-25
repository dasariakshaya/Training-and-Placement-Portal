// routes/verifier.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authenticateToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// All routes in this file are for verifiers
router.use(authenticateToken, authorize(['verifier']));

// GET /api/verifier/unverified - Get all unverified students
router.get('/unverified', async (req, res) => {
  try {
    const unverifiedStudents = await Student.find({ verified: false }).select('name email rollNumber branch');
    res.json(unverifiedStudents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unverified students.' });
  }
});

// PATCH /api/verifier/verify/:studentId - Verify a student
router.patch('/verify/:studentId', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { verified: true },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    res.json({ message: `${student.name} has been verified successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;