// Backend router for chatbot API proxy.
// Business logic lives in chatbotController.js.

const express = require('express');
const router = express.Router();
const chatbotController = require('../../controllers/chatbotController');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with the NITE AI Chatbot
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
 *       400:
 *         description: Missing message in request body
 *       500:
 *         description: Failed to communicate with the chatbot
 */
router.post('/api/chat', chatbotController.chat);

module.exports = router;