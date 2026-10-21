const AppError = require('../utils/AppError');
const managerRepository = require('../repositories/managerRepository');
const storeRepository = require('../repositories/storeRepository');

async function assignStore(userId, storeId) {
  if (!storeId) throw new AppError(400, 'storeId is required');
  const user = await managerRepository.findUserById(userId);
  if (!user) throw new AppError(404, 'user not found');
  if (user.role !== 'manager') throw new AppError(400, 'user is not a manager');
  const store = await storeRepository.findById(storeId);
  if (!store) throw new AppError(404, 'store not found');
  if (!store.active) throw new AppError(409, 'cannot assign a manager to an inactive store');
  return managerRepository.setStore(userId, storeId);
}

module.exports = { assignStore };
