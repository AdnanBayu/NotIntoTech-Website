const express = require('express');
const router = express.Router();
const homeRoutes = require('./homeRouter');
const insightsRoutes = require('./insightsRouter');
const feedbackformRoutes = require('./feedbackformRouter');
const requestRoutes = require('./requestRouter');
const comingsoonRoutes = require('./comingsoonRouter');
const datasetRoutes = require('./dataRouter');
const errorRoutes = require('./errorRouter');
const aiRoutes = require('./aiRouter');
const profileRoutes = require('./profileRouter');

router.use('/', homeRoutes);
router.use('/', insightsRoutes);
router.use('/', feedbackformRoutes);
router.use('/', requestRoutes);
router.use('/', comingsoonRoutes);
router.use('/', datasetRoutes);
router.use('/', errorRoutes);
router.use('/', aiRoutes);
router.use('/', profileRoutes);

module.exports = router;