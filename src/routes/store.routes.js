const express = require('express');
const controller = require('../controllers/storeController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();
router.use(authenticate, authorizeRoles('admin'));

/**
 * @openapi
 * /api/stores:
 *   get:
 *     summary: List all stores (Admin)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of stores }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/stores:
 *   post:
 *     summary: Create a store (Admin)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: Store created }
 *       400: { description: Validation error }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       409: { description: Store name already exists }
 */
router.post('/', controller.create);

/**
 * @openapi
 * /api/stores/{storeId}:
 *   get:
 *     summary: Get a store by id (Admin)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Store }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.get('/:storeId', controller.get);

/**
 * @openapi
 * /api/stores/{storeId}:
 *   put:
 *     summary: Update a store (Admin)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *     responses:
 *       200: { description: Updated store }
 *       400: { description: Validation error }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.put('/:storeId', controller.update);

/**
 * @openapi
 * /api/stores/{storeId}/deactivate:
 *   patch:
 *     summary: Deactivate a store (Admin) - idempotent
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deactivated store }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.patch('/:storeId/deactivate', controller.deactivate);

module.exports = router;
