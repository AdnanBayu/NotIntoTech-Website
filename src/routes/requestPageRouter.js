const express = require('express');
const router = express.Router();

router.get('/request', (req, res) => {
    res.render('datasets/request-data', { message: null, error: null });
});

module.exports = router;