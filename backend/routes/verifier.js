const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Student = require('../models/Student');

// ✅ GET all unverified students
router.get('/unverified', verifyToken, async (req, res) => {
  try {
    const unverified = await Student.find({ verified: false });
    res.status(200).json(unverified);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unverified students' });
  }
});

// ✅ VERIFY a student by ID
router.get('/verify/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { verified: true },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student verified successfully', student: updatedStudent });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
