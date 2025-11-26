const express = require('express');
const router = express.Router();

router.get('/insights', (req, res) => {
    res.render('page-insights', { message: null, error: null });
});

module.exports = router;