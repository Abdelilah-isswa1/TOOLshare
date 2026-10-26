const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const managerStoreScope = require('../middlewares/managerStoreScope');
const validate = require('../middlewares/validate');
const ROLES = require('../constants/roles');
const {
  createEquipmentSchema, updateEquipmentSchema, idParamSchema, listEquipmentQuerySchema,
} = require('../validators/equipment');
const controller = require('../controllers/equipment');

router.use(authenticate, authorizeRoles(ROLES.MANAGER), managerStoreScope());

router.post('/', validate(createEquipmentSchema), controller.create);
router.get('/', validate(listEquipmentQuerySchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getOne);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateEquipmentSchema), controller.update);
router.patch('/:id/deactivate', validate(idParamSchema, 'params'), controller.deactivate);
router.patch('/:id/reactivate', validate(idParamSchema, 'params'), controller.reactivate);

module.exports = router;