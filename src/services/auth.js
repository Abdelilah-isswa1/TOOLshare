const AppError = require('../utils/AppError');
const userRepository = require('../repositories/User');
const { signToken } = require('../utils/jwt');

const INVALID = 'Identifiants incorrects';

const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(INVALID, 401);


};
