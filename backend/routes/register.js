const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Student = require('../models/Student');

// 📌 Roll number must match something like: IIITM2025CSE, IIITM2024ECE, etc.
const validRollRegex = /^IIITM\d{4}[A-Z]{2,4}$/;

router.post('/', async (req, res) => {
  try {
    const { name, email, password, rollNumber, branch, resumeLink } = req.body;

    // ✅ Validate roll number format
    if (!validRollRegex.test(rollNumber)) {
      return res.status(400).json({ error: 'Invalid roll number format. Only IIITM roll numbers allowed.' });
    }

    // ❌ Check for existing user by email or rollNumber
    const existingUser = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Email already exists' });
      } else {
        return res.status(409).json({ error: 'Roll number already exists' });
      }
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📦 Create new student doc with default verification flags
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      branch,
      resumeLink: resumeLink || '', // default to empty if not provided
      verified: false,
      placed: false
    });

    await newStudent.save();

    res.status(201).json({ message: 'Student registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

module.exports = router;
