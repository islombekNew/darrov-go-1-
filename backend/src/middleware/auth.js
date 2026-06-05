const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token kerak' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz' });
  }
};

module.exports.adminOnly = function (req, res, next) {
  if (!['ADMIN', 'SUPERADMIN'].includes(req.userRole)) {
    return res.status(403).json({ error: 'Admin huquqi kerak' });
  }
  next();
};
