const Store = require('../models/Store');

module.exports = {
  findActiveStoresWithEquipment: () =>
    Store.find({ active: true })
      .sort({ name: 1 })
      .populate({ path: 'equipment', match: { status: { $ne: 'retired' } }, options: { sort: { name: 1 } } }),
};
