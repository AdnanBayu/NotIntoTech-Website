const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/profile', pageController.showProfile);

module.exports = router;