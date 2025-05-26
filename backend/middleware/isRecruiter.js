const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load .env variables

const isRecruiter = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied: Not a recruiter' });
    }

    req.recruiter = { id: decoded.id };
    next();
  } catch (err) {
    console.error('❌ Invalid recruiter token:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = isRecruiter;
