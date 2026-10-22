const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/User');

module.exports = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token)
        throw new AppError('Authentification requise', 401);

    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.id);
    if (!user) throw new AppError('Utilisateur introuvable', 401);
    if (!user.is_active) throw new AppError('Compte désactivé', 403);

    req.user = user;
    next();
});