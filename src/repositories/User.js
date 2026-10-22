const User = require('../models/User');

const findByEmail = (email) =>
    User.findOne({ email: email.toLowerCase().trim() }).select('+password');