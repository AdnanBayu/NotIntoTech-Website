const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with the NotIntoTech AI Chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message
 *               sessionId:
 *                 type: string
 *                 description: An optional session ID
 *     responses:
 *       200:
 *         description: The chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The chatbot's reply
 *       400:
 *         description: Missing message in request body
 *       500:
 *         description: Failed to communicate with the chatbot
 */
// Proxy Route for Chatbot
router.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: "Missing 'message' in request body" });
        }

        const n8nUrl = process.env.N8N_WEBHOOK_URL;

        const n8nResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId || 'default-session',
                source: 'web-client',
                timestamp: new Date().toISOString()
            })
        });

        if (!n8nResponse.ok) {
            const errBody = await n8nResponse.text();
            throw new Error(`chatbot responded with status: ${n8nResponse.status}, body: ${errBody}`);
        }

        const rawText = await n8nResponse.text();
        let data;
        try {
            data = rawText ? JSON.parse(rawText) : { response: "Empty response from chatbot" };
        } catch (e) {
            data = { response: rawText };
        }

        res.json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Failed to communicate with the chatbot.', details: error.message });
    }
});

module.exports = router;