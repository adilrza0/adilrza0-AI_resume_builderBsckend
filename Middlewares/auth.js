const jwt = require('jsonwebtoken');
const auth = function (req, res, next) {
  const raw = req.header('authorization');
  if (!raw) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  // Support both "Bearer <token>" and raw token
  const parts = raw.split(' ');
  const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : raw;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth
