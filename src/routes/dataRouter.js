const express = require('express');
const router = express.Router();

router.get('/data', (req, res) => {
    res.render('page-data', { message: null, error: null });
});

module.exports = router;