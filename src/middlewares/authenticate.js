const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

// STUB - replaced by Khalid's TOOL-23
// Verifies the Bearer JWT and attaches req.user = { id, role, storeId }.
module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'authentication required'));
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
      storeId: payload.storeId || null,
    };
    next();
  } catch {
    return next(new AppError(401, 'invalid or expired token'));
  }
};
