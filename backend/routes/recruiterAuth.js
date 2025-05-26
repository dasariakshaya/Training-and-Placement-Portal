const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Recruiter = require('../models/recruiter');
require('dotenv').config(); // ✅ Load environment variables

const router = express.Router();

// ✅ Recruiter Registration
router.post('/register', async (req, res) => {
  const { email, password, company, contactPerson } = req.body;

  try {
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ error: 'Recruiter already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRecruiter = new Recruiter({
      email,
      password: hashedPassword,
      company,
      contactPerson,
    });

    await newRecruiter.save();
    res.status(201).json({ message: 'Recruiter registered successfully' });
  } catch (err) {
    console.error('Recruiter registration error:', err);
    res.status(500).json({ error: 'Failed to register recruiter' });
  }
});

// ✅ Recruiter Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) return res.status(404).json({ error: 'Recruiter not found' });

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: recruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
