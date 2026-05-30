const express        = require('express');
const router         = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/coming-soon', pageController.showComingSoon);

module.exports = router;