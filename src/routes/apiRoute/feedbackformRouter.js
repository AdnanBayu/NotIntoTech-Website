// Router for feedback form submission.
// Business logic lives in feedbackController.js.

const express            = require('express');
const router             = express.Router();
const feedbackController = require('../../controllers/feedbackController');

/**
 * @swagger
 * /feedback-form:
 *   post:
 *     summary: Submit feedback
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - feedback-name
 *               - feedback-email
 *               - feedback-text
 *             properties:
 *               feedback-name:
 *                 type: string
 *               feedback-email:
 *                 type: string
 *                 format: email
 *               feedback-text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback sent successfully (renders page)
 *       500:
 *         description: Error sending feedback (renders page with error)
 */
router.post('/feedback-form', feedbackController.submitFeedback);

module.exports = router;