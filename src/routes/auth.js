const router = require('express').Router();
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const { loginSchema } = require('../validators/auth');
const controller = require('../controllers/auth');
const ROLES = require('../constants/roles');

router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validate(createStoreSchema), controller.create);
router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), controller.list);

module.exports = router;