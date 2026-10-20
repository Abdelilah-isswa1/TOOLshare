// Manager "repository" lives in userRepository - managers are users with role 'manager'.
const User = require('../models/User');

module.exports = {
  findUserById: (id) => User.findById(id),
  setStore: (userId, storeId) => User.findByIdAndUpdate(userId, { store: storeId }, { new: true }).select('-password'),
};
