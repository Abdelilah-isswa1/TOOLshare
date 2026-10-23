const Joi = require('joi');
const ROLES = require('../constants/roles');

const objectId = Joi.string().hex().length(24);

const createUserSchema = Joi.object({
    first_name: Joi.string().trim().min(2).required(),
    last_name: Joi.string().trim().min(2).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(8).required(),

    role: Joi.string().valid(ROLES.MANAGER, ROLES.USER).default(ROLES.USER),

    store: Joi.when('role', {
        is: ROLES.MANAGER,
        then: objectId.required(),
        otherwise: objectId.optional(),
    }),
});

module.exports = { createUserSchema };