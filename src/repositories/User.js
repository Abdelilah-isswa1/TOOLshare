const User = require('../models/User');

const findByEmail = (email) =>
    User.findOne({ email: email.toLowerCase().trim() }).select('+password');

const findById = (id) => User.findById(id);

module.exports = { findByEmail, findById };