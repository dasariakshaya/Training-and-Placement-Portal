const Student = require('../models/student');

const isVerifier = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (user.role !== 'verifier') {
      return res.status(403).json({ error: 'Access denied: Verifiers only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error validating verifier' });
  }
};

module.exports = isVerifier;
