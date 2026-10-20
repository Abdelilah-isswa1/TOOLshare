const express = require('express');
const controller = require('../controllers/reservationController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();
router.use(authenticate);

/**
 * @openapi
 * /api/reservations:
 *   post:
 *     summary: Book equipment for a time slot (User)
 *     description: >
 *       startDate must be on a 30-minute boundary (UTC) and durationHours a multiple of 0.5
 *       (max 168). Two simultaneous requests for the same slot yield exactly one 201.
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeId, equipmentId, startDate, durationHours]
 *             properties:
 *               storeId: { type: string }
 *               equipmentId: { type: string }
 *               startDate: { type: string, format: date-time }
 *               durationHours: { type: number, example: 2 }
 *     responses:
 *       201: { description: Reservation confirmed, with its unique reference }
 *       400: { description: Validation error }
 *       401: { description: Unauthenticated }
 *       403: { description: Forbidden }
 *       404: { description: Store not found or inactive }
 *       409: { description: Slot already taken or equipment unavailable }
 */
router.post('/', authorizeRoles('user'), controller.create);

module.exports = router;
