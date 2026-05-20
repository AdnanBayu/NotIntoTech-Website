const express = require('express');
const User = require('../model/feedback-model');
const router = express.Router();

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
 *                 description: Name of the feedback sender
 *               feedback-email:
 *                 type: string
 *                 format: email
 *                 description: Email of the feedback sender
 *               feedback-text:
 *                 type: string
 *                 description: Feedback message content
 *     responses:
 *       200:
 *         description: Feedback sent successfully (renders page)
 *       500:
 *         description: Error sending feedback (renders page with error)
 */
router.post('/feedback-form', async (req, res) => {
    try {
        console.log('Received feedback data:', req.body);

        const newUser = new User({
            feedback_name: req.body['feedback-name'],
            feedback_email: req.body['feedback-email'],
            feedback_text: req.body['feedback-text'],
        });
        await newUser.save();
        console.log('Feedback sent successfully');

        res.render('index', {
            message: 'Feedback sent!',
            error: null
        });
    } catch (err) {
        console.error('Error sending feedback:', err);
        res.status(500).render(
            'index',
            {
                message: null,
                error: 'Error sending feedback'
            }
        );
    }
});

module.exports = router;