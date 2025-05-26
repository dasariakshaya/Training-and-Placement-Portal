// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// ✅ Only Login Route (Register moved to register.js)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student || student.password !== password) {
    return res.status(401).send({ error: "Invalid credentials!" });
  }

  res.send({ message: "Login successful!", student });
});

module.exports = router;
