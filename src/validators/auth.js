const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
});

module.exports = { loginSchema };