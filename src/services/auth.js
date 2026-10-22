const AppError = require('../utils/AppError');
const userRepository = require('../repositories/User');
const { signToken } = require('../utils/jwt');

const INVALID = 'Identifiants incorrects';

const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(INVALID, 401);

    const ok = await user.comparePassword(password);
    if (!ok) throw new AppError(INVALID, 401);

    if (!user.is_active) throw new AppError('Compte désactivé', 403);

    const token = signToken(user);
    const { password: _pw, ...safeUser } = user.toObject();
    return { token, user: safeUser };
};

module.exports = { login };