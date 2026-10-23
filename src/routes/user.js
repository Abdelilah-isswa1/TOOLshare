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

router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateMe);
router.patch('/me/password', authenticate, validate(changePasswordSchema), controller.changeMyPassword);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  validate(createUserSchema),
  controller.create
);

module.exports = router;