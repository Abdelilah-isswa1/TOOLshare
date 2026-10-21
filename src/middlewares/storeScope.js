const AppError = require('../utils/AppError');

// STUB - replaced by Khalid's TOOL-23
// Ensures a manager can only act on the store they are assigned to.
module.exports = function storeScope(req, res, next) {
  const storeId = req.params.storeId || req.body.storeId;
  if (req.user && req.user.role === 'manager' && storeId && String(req.user.storeId) !== String(storeId)) {
    return next(new AppError(403, 'forbidden: outside your store scope'));
  }
  next();
};
