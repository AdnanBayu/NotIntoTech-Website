const express = require('express');
const router = express.Router();

router.get('/ai', (req, res) => {
    res.render('ai/page-ai', { message: null, error: null });
});

module.exports = router;