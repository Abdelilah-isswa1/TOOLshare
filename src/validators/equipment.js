const Joi = require('joi');
const STATES = require('../constants/equipmentStates');

const objectId = Joi.string().hex().length(24);
const states = Object.values(STATES);

const createEquipmentSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  reference: Joi.string().trim().min(2).required(),
  categorie: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().allow(''),
  etatMateriel: Joi.string().valid(...states),
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().trim().min(2),
  reference: Joi.string().trim().min(2),
  categorie: Joi.string().trim().min(2),
  description: Joi.string().trim().allow(''),
  etatMateriel: Joi.string().valid(...states),
}).min(1);