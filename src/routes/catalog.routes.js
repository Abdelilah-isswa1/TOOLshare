const express = require('express');
const controller = require('../controllers/catalogController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();
router.use(authenticate, authorizeRoles('admin', 'manager', 'user'));

/**
 * @openapi
 * /api/catalog/stores:
 *   get:
 *     summary: List active stores with their equipment (any authenticated user)
 *     tags: [Catalog]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Active stores and their equipment }
 *       401: { description: Unauthenticated }
 */
router.get('/stores', controller.listStores);

module.exports = router;
