const express = require('express');
const controller = require('../controllers/managerController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();
router.use(authenticate, authorizeRoles('admin'));

/**
 * @openapi
 * /api/managers/{userId}/store:
 *   put:
 *     summary: Assign or change the store of a manager (Admin)
 *     tags: [Managers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeId]
 *             properties:
 *               storeId: { type: string }
 *     responses:
 *       200: { description: Manager updated with new store }
 *       400: { description: Validation error or user is not a manager }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       404: { description: User or store not found }
 *       409: { description: Store is inactive }
 */
router.put('/:userId/store', controller.assignStore);

module.exports = router;
