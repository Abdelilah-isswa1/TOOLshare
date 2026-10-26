const AppError = require('../utils/AppError');
const equipmentRepository = require('../repositories/equipment');
const storeRepository = require('../repositories/store');

const getOwned = async (id, manager) => {
  const equipment = await equipmentRepository.findById(id);
  if (!equipment || equipment.store.toString() !== manager.store.toString())
    throw new AppError('Équipement introuvable', 404);
  return equipment;
};

const createEquipment = async (payload, manager) => {
  const store = await storeRepository.findById(manager.store);
  if (!store) throw new AppError('Magasin introuvable', 404);
  if (store.isActive === false) throw new AppError('Magasin inactif', 400);

  if (await equipmentRepository.findByReference(payload.reference))
    throw new AppError('Référence déjà utilisée', 409);

  return equipmentRepository.create({ ...payload, store: manager.store });
};