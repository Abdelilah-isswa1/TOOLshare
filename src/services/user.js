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

  if (creator.role === ROLES.MANAGER) {
    if (role !== ROLES.USER)
      throw new AppError('Un gestionnaire ne peut créer que des utilisateurs', 403);
  } else if (creator.role === ROLES.ADMIN) {
    if (role === ROLES.MANAGER) {
      if (!payload.store) throw new AppError('Le magasin est requis pour un gestionnaire', 400);
      const found = await storeRepository.findById(payload.store);
      if (!found) throw new AppError('Magasin introuvable', 404);
      if (found.isActive === false) throw new AppError('Magasin inactif', 400);
      store = found._id;
    } else if (payload.store) {
      throw new AppError('Un utilisateur ne peut pas être rattaché à un magasin', 400);
    }
  } else {
    throw new AppError('Accès refusé', 403);
  }

  if (await userRepository.findByEmail(email))
    throw new AppError('Email déjà utilisé', 409);

  return userRepository.create({
    firstName, lastName, email, password, role,
    ...(store && { store }),
    createdBy: creator._id,
  });
};

const updateProfile = async (userId, payload) => {
  
  const data = {};
  for (const key of ['firstName', 'lastName', 'email']) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }

  if (data.email && (await userRepository.emailTakenByOther(data.email, userId)))
    throw new AppError('Email déjà utilisé', 409);

  const user = await userRepository.updateById(userId, data);
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user; 
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw new AppError('Utilisateur introuvable', 404);

  if (!(await user.comparePassword(currentPassword)))
    throw new AppError('Mot de passe actuel incorrect', 400); 

  if (await user.comparePassword(newPassword))
    throw new AppError('Le nouveau mot de passe doit être différent', 400);

  user.password = newPassword;          
  user.passwordChangedAt = new Date();  
  await user.save();

  return { message: 'Mot de passe modifié avec succès' };
};

module.exports = { createUser, updateProfile, changePassword };

