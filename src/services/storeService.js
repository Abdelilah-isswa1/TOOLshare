const AppError = require('../utils/AppError');
const storeRepository = require('../repositories/storeRepository');

async function listStores() {
  return storeRepository.findAll();
}

async function getStore(id) {
  const store = await storeRepository.findById(id);
  if (!store) throw new AppError(404, 'store not found');
  return store;
}

async function createStore({ name, address }) {
  if (!name || !address) throw new AppError(400, 'name and address are required');
  if (await storeRepository.findByName(name)) throw new AppError(409, 'a store with this name already exists');
  return storeRepository.create({ name, address });
}

async function updateStore(id, { name, address }) {
  await getStore(id);
  if (!name && !address) throw new AppError(400, 'nothing to update');
  return storeRepository.update(id, { name, address });
}

async function deactivateStore(id) {
  const store = await getStore(id);
  if (!store.active) return store; // idempotent
  return storeRepository.setActive(id, false);
}

module.exports = { listStores, getStore, createStore, updateStore, deactivateStore };
