const Equipment = require('../models/Equipment');

module.exports = {
  findById: (id) => Equipment.findById(id),
  findByIdAndStore: (id, storeId) => Equipment.findOne({ _id: id, store: storeId }),
  findActiveByStore: (storeId) => Equipment.find({ store: storeId, status: { $ne: 'retired' } }).sort({ name: 1 }),
};
