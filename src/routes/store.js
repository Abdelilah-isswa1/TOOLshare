const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const managerStoreScope = require('../middlewares/managerStoreScope');
const validate = require('../middlewares/validate');
const ROLES = require('../constants/roles');
const { createStoreSchema } = require('../validators/store');
const controller = require('../controllers/store');

router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validate(createStoreSchema), controller.create);


module.exports = router;