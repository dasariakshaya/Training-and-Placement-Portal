const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load env vars
require('dotenv').config();

// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
     
    console.log("JWT Secret is:", process.env.JWT_SECRET);

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET, // 🧠 loaded from .env
      { expiresIn: '2h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
