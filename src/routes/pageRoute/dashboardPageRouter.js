const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/dashboard', pageController.showDashboard);

module.exports = router;
