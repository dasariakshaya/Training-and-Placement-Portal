const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Verifier = require('../models/verifier');

// LOGIN only - no register
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const verifier = await Verifier.findOne({ email });
  if (!verifier || verifier.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: verifier._id, role: 'verifier', email: verifier.email },
    'your-secret-key',
    { expiresIn: '2h' }
  );

  res.status(200).json({ message: 'Login successful', token });
});

module.exports = router;
