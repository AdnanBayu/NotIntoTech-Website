const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
    res.render('page-profile', { message: null, error: null });
});

module.exports = router;