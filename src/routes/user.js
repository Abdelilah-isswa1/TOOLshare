const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const validate = require('../middlewares/validate');
const ROLES = require('../constants/roles');

const {
  createUserSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/user');
const controller = require('../controllers/user');