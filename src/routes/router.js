const express = require('express');
const router = express.Router();

const homePageRoutes = require('./homePageRouter');
const comingsoonPageRoutes = require('./comingsoonPageRouter');
const errorPageRoutes = require('./errorPageRouter');
const profilePageRoutes = require('./profilePageRouter');
const insightsPageRoutes = require('./insightsPageRouter');
const datasetPageRoutes = require('./datasetPageRouter');
const chatbotPageRoutes = require('./chatbotPageRouter');
const requestPageRoutes = require('./requestPageRouter');
const dashboardPageRoutes = require('./dashboardPageRouter');

const requestformRoutes = require('./requestformRouter');
const feedbackformRoutes = require('./feedbackformRouter');

const insightsApiRoutes = require('./insightsApiRouter');
const datasetApiRoutes = require('./datasetApiRouter');
const chatbotApiRoutes = require('./chatbotApiRouter');
const uploadApiRoutes = require('./uploadR2ApiRouter');


router.use('/', homePageRoutes);
router.use('/', requestPageRoutes);
router.use('/', profilePageRoutes);
router.use('/', insightsPageRoutes);
router.use('/', datasetPageRoutes);
router.use('/', chatbotPageRoutes);
router.use('/', dashboardPageRoutes);
router.use('/', comingsoonPageRoutes);
router.use('/', errorPageRoutes);

router.use('/', feedbackformRoutes);
router.use('/', requestformRoutes);

router.use('/', insightsApiRoutes);
router.use('/', datasetApiRoutes);
router.use('/', chatbotApiRoutes);
router.use('/', uploadApiRoutes);

module.exports = router;