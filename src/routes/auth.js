const router = require('express').Router();
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const { loginSchema } = require('../validators/auth');
const controller = require('../controllers/auth');
