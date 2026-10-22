const AppError = require('../utils/AppError');

module.exports = (req, res, next) =>
    next(new AppError(`Route introuvable: ${req.method} ${req.originalUrl}`, 404));