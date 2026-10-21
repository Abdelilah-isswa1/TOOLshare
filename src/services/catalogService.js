const catalogRepository = require('../repositories/catalogRepository');

// Active stores, each with the list of its non-retired equipment.
// (populate on the virtual 'equipment' ref defined below)
async function listActiveStoresWithEquipment() {
  return catalogRepository.findActiveStoresWithEquipment();
}

module.exports = { listActiveStoresWithEquipment };
