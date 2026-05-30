// Controller for the chatbot API proxy.
// Forwards messages to the n8n webhook and returns the AI response.

/*
 POST /api/chat
 Proxy a chat message to the n8n webhook and return the response.
*/
exports.chat = async (req, res) => {
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
        message,
        sessionId: sessionId || 'default-session',
        source: 'web-client',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      const errBody = await n8nResponse.text();
      throw new Error(`Chatbot responded with status: ${n8nResponse.status}, body: ${errBody}`);
    }

    const rawText = await n8nResponse.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : { response: 'Empty response from chatbot' };
    } catch (e) {
      data = { response: rawText };
    }

    res.json(data);
  } catch (error) {
    console.error('Chatbot proxy error:', error);
    res.status(500).json({
      error: 'Failed to communicate with the chatbot.',
      details: error.message,
    });
  }
};
