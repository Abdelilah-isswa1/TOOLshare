const User = require('../models/User');

const findByEmail = (email) =>
    User.fndOne({ email: email.toLowerCase().trim() }).select('+password');