const AppError = require('../utils/AppError');

// STUB - replaced by Khalid's TOOL-23
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'forbidden'));
  }
  next();
};
