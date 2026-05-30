const express        = require('express');
const router         = express.Router();
const pageController = require('../../controllers/pageController');

router.get('/request', pageController.showRequest);

module.exports = router;