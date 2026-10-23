const AppError = require('../utils/AppError');

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user) return next(new AppError('Authentification requise', 401));
    if (!allowedRoles.includes(req.user.role))
        return next(new AppError('Accès refusé', 403));
    next();
};

module.exports = authorizeRoles;