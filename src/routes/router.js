const express = require('express');
const router = express.Router();
const homeRoutes = require('./homeRouter');
const comingsoonRoutes = require('./comingsoonRouter');
const errorRoutes = require('./errorRouter');
const profileRoutes = require('./profileRouter');
const insightsRoutes = require('./insightsRouter');
const insightsApiRoutes = require('./insightsApiRouter');
const datasetRoutes = require('./datasetRouter');
const datasetApiRoutes = require('./datasetApiRouter');
const aiRoutes = require('./aiRouter');
const chatbotApiRouter = require('./chatbotApiRouter');
const requestRoutes = require('./requestRouter');
const feedbackformRoutes = require('./feedbackformRouter');
const requestformRoutes = require('./requestformRouter');
const dashboardRoutes = require('./dashboardRouter');
const uploadApiRoutes = require('./uploadR2ApiRouter');

router.use('/', homeRoutes);
router.use('/', requestRoutes);
router.use('/', profileRoutes);

router.use('/', insightsRoutes);
router.use('/', insightsApiRoutes);
router.use('/', datasetRoutes);
router.use('/', datasetApiRoutes);
router.use('/', aiRoutes);
router.use('/', chatbotApiRouter);

router.use('/', feedbackformRoutes);
router.use('/', requestformRoutes);

router.use('/', comingsoonRoutes);
router.use('/', errorRoutes);

router.use('/', dashboardRoutes);
router.use('/', uploadApiRoutes);

module.exports = router;