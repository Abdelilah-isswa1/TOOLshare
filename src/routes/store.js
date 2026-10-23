const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const managerStoreScope = require('../middlewares/managerStoreScope');
const validate = require('../middlewares/validate');
const ROLES = require('../constants/roles');


router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validate(createStoreSchema), controller.create);


module.exports = router;