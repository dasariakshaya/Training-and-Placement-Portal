const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(403).json({ error: 'Access denied. Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = isAdmin;
