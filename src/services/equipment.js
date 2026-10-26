const AppError = require('../utils/AppError');
const equipmentRepository = require('../repositories/equipment');
const storeRepository = require('../repositories/store');

const getOwned = async (id, manager) => {
  const equipment = await equipmentRepository.findById(id);
  if (!equipment || equipment.store.toString() !== manager.store.toString())
    throw new AppError('Équipement introuvable', 404);
  return equipment;
};