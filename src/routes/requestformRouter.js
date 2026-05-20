const express = require('express');
const User = require('../model/request-model');
const router = express.Router();

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
 *                 description: Name of the requester
 *               request-email:
 *                 type: string
 *                 format: email
 *                 description: Email of the requester
 *               request-text:
 *                 type: string
 *                 description: Description of the data request
 *     responses:
 *       200:
 *         description: Request sent successfully (renders page)
 *       500:
 *         description: Error sending request (renders page with error)
 */
router.post('/request-form', async (req, res) => {
    try {
        console.log('Received request data:', req.body);

        const newUser = new User({
            request_name: req.body['request-name'],
            request_email: req.body['request-email'],
            request_text: req.body['request-text'],
        });
        await newUser.save();
        console.log('Request sent successfully');

        res.render('request-data', {
            message: 'Request sent!',
            error: null
        });
    } catch (err) {
        console.error('Error sending request:', err);
        res.status(500).render(
            'request-data',
            {
                message: null,
                error: 'Error sending request'
            }
        );
    }
});

module.exports = router;