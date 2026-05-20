const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.render('dashboard/page-dashboard', { message: null, error: null });
});

module.exports = router;
