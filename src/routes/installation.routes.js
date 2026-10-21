const express = require('express');
const controller = require('../controllers/installationController');

const router = express.Router();

/**
 * @openapi
 * /api/installation/status:
 *   get:
 *     summary: Check whether the system has been installed (first-run setup status)
 *     tags: [Installation]
 *     responses:
 *       200:
 *         description: Installation status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 installed: { type: boolean }
 */
router.get('/status', controller.getStatus);

/**
 * @openapi
 * /api/installation:
 *   post:
 *     summary: Run first-run setup - creates the initial Admin user (once)
 *     tags: [Installation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201: { description: Initial admin created }
 *       400: { description: Validation error }
 *       409: { description: System already installed }
 */
router.post('/', controller.install);

module.exports = router;
