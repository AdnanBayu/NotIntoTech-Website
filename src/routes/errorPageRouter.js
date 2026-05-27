const express = require('express');
const router = express.Router();

router.get('/error', (req, res) => {
    res.render('error', { message: 'An error occurred', error: null });
});

module.exports = router;