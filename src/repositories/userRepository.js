const User = require('../models/User');

module.exports = {
  findById: (id) => User.findById(id),
  findByEmail: (email) => User.findOne({ email }),
  countAdmins: () => User.countDocuments({ role: 'admin' }),
  createAdmin: ({ name, email, passwordHash }) =>
    User.create({ name, email, password: passwordHash, role: 'admin' }),
};
