const AppError = require('../utils/AppError');

const normalize = (err) => {
    if (err instanceof AppError) return err;

    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((e) => ({
            field: e.path, message: e.message,
        }));
        return new AppError('Données invalides', 400, details);
    }
    if (err.name === 'CastError')
        return new AppError(`Valeur invalide pour "${err.path}"`, 400);

    if (err.code === 11000) {
        const fields = Object.keys(err.keyValue || {}).join(', ');
        return new AppError(`Valeur déjà utilisée: ${fields}`, 409,
            Object.keys(err.keyValue || {}).map((f) => ({ field: f, message: 'déjà utilisé' })));
    }
    if (err.name === 'TokenExpiredError') return new AppError('Token expiré', 401);
    if (err.name === 'JsonWebTokenError') return new AppError('Token invalide', 401);

    if (err instanceof SyntaxError && err.type === 'entity.parse.failed')
        return new AppError('JSON invalide dans la requête', 400);

    return err;
};


module.exports = (err, req, res, next) => {
    const e = normalize(err);
    const operational = e instanceof AppError && e.isOperational;

    if (!operational) console.error(err.stack || err);

    const statusCode = operational ? e.statusCode : 500;
    const body = {
        success: false,
        message: operational ? e.message : 'Erreur interne du serveur',
    };
    if (operational && e.details) body.details = e.details;
    if (process.env.NODE_ENV !== 'production') body.stack = err.stack;

    res.status(statusCode).json(body);
};