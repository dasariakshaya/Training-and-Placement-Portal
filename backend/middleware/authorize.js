// middleware/authorize.js

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access forbidden. User role not found.' });
    }

    const hasPermission = allowedRoles.includes(req.user.role);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access forbidden. You do not have the required permissions.' });
    }
    
    next();
  };
};

module.exports = authorize;