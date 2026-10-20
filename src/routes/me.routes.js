const express = require('express');
const controller = require('../controllers/meController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();
router.use(authenticate, authorizeRoles('user'));

/**
 * @openapi
 * /api/me/reservations:
 *   get:
 *     summary: My upcoming (confirmed) reservations
 *     tags: [Me]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The caller's confirmed reservations only }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 */
router.get('/reservations', controller.reservations);

/**
 * @openapi
 * /api/me/loans:
 *   get:
 *     summary: My current loans (reservations in progress)
 *     tags: [Me]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The caller's in-progress loans only }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 */
router.get('/loans', controller.loans);

/**
 * @openapi
 * /api/me/history:
 *   get:
 *     summary: My history (returned and cancelled reservations, newest first)
 *     tags: [Me]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The caller's finished reservations only }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 */
router.get('/history', controller.history);

module.exports = router;
