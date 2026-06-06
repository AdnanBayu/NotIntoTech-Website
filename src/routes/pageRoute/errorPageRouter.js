const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/error', pageController.showError);

module.exports = router;