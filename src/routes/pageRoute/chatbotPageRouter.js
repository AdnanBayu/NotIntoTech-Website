const express        = require('express');
const router         = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/nitebot', pageController.showChatbot);

module.exports = router;