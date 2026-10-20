const Store = require('../models/Store');

module.exports = {
  findAll: () => Store.find({}).sort({ name: 1 }),
  findById: (id) => Store.findById(id),
  findByName: (name) => Store.findOne({ name }),
  create: ({ name, address }) => Store.create({ name, address }),
  update: (id, { name, address }) => {
    const changes = {};
    if (name !== undefined) changes.name = name;
    if (address !== undefined) changes.address = address;
    return Store.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  },
  setActive: (id, active) => Store.findByIdAndUpdate(id, { active }, { new: true }),
};
