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

const idParamSchema = Joi.object({ id: objectId.required() });

const listEquipmentQuerySchema = Joi.object({
  categorie: Joi.string().trim(),
  etatMateriel: Joi.string().valid(...states),
  isActive: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'name', '-name').default('-createdAt'),
});

module.exports = {
  createEquipmentSchema, updateEquipmentSchema, idParamSchema, listEquipmentQuerySchema,
};