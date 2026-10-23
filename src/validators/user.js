const Joi = require('joi');
const ROLES = require('../constants/roles');

const objectId = Joi.string().hex().length(24);
const passwordRule = Joi.string().min(8).max(72); 

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).required(),
  lastName: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordRule.required(),
  role: Joi.string().valid(ROLES.MANAGER, ROLES.USER).default(ROLES.USER),
  store: Joi.when('role', {
    is: ROLES.MANAGER,
    then: objectId.required(),
    otherwise: objectId.optional(),
  }),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2),
  lastName: Joi.string().trim().min(2),
  email: Joi.string().trim().lowercase().email(),
}).min(1); 

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordRule.required(),
});

module.exports = { createUserSchema, updateProfileSchema, changePasswordSchema };