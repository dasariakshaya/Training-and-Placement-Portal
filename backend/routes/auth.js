// routes/auth.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * @route   POST /api/login
 * @desc    Student login - returns JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Check if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 🔐 Validate password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Generate token with only the student ID
    const token = jwt.sign(
      { id: student._id }, // 👈 Essential for backend routes using req.user.id
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🎉 Respond with token and basic student info
    res.json({
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
