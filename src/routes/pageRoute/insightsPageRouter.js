const express = require('express');
const router = express.Router();
const insightsController = require('../../controllers/insightsController');

router.get('/insights', insightsController.showInsightsPage);
router.get('/insights/:slug', insightsController.showInsightDetail);

module.exports = router;