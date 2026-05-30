// Router for data request form submission.
// Business logic lives in requestController.js.

const express           = require('express');
const router            = express.Router();
const requestController = require('../../controllers/requestController');

/**
 * @swagger
 * /request-form:
 *   post:
 *     summary: Submit a data request
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - request-name
 *               - request-email
 *               - request-text
 *             properties:
 *               request-name:
 *                 type: string
 *               request-email:
 *                 type: string
 *                 format: email
 *               request-text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request sent successfully (renders page)
 *       500:
 *         description: Error sending request (renders page with error)
 */
router.post('/request-form', requestController.submitRequest);

module.exports = router;