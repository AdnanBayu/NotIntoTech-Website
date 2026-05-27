const express = require('express');
const router = express.Router();

router.get('/coming-soon', (req, res) => {
    res.render('coming-soon', { message: null, error: null });
});

module.exports = router;