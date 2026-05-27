const express = require('express');
const User = require('../model/feedback-model');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { message: null, error: null });
});

module.exports = router;