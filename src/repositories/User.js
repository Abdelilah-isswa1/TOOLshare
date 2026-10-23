const User = require('../models/User');

const findByEmail = (email) =>
    User.findOne({ email: email.toLowerCase().trim() }).select('+password');

const findById = (id) => User.findById(id);

const create = async (data) => {
    const doc = await User.create(data);
    const { password, ...safe } = doc.toObject();
    return safe;
};


module.exports = { findByEmail, findById, create };