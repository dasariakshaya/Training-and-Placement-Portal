const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

// 🔐 Admin Login Only — No Registration
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Received login for:", username);

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      console.log("Admin not found in DB");
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
