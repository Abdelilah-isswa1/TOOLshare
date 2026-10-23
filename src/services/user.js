const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');
const userRepository = require('../repositories/User');
const storeRepository = require('../repositories/store');

const createUser = async (payload, creator) => {
  const { firstName, lastName, email, password } = payload;
  const role = payload.role || ROLES.USER;
  let store;

  if (role === ROLES.ADMIN)
    throw new AppError('La création d’un administrateur n’est pas autorisée', 403);

  
};