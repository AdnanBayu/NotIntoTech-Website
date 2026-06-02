const express = require('express');
const router = express.Router();

const homePageRoutes = require('./pageRoute/homePageRouter');
const comingsoonPageRoutes = require('./pageRoute/comingsoonPageRouter');
const errorPageRoutes = require('./pageRoute/errorPageRouter');
const profilePageRoutes = require('./pageRoute/profilePageRouter');
const insightsPageRoutes = require('./pageRoute/insightsPageRouter');
const datasetPageRoutes = require('./pageRoute/datasetPageRouter');
const chatbotPageRoutes = require('./pageRoute/chatbotPageRouter');
const dashboardPageRoutes = require('./pageRoute/dashboardPageRouter');

const feedbackformRoutes = require('./apiRoute/feedbackformRouter');

const insightsApiRoutes = require('./apiRoute/insightsApiRouter');
const datasetApiRoutes = require('./apiRoute/datasetApiRouter');
const chatbotApiRoutes = require('./apiRoute/chatbotApiRouter');
const uploadApiRoutes = require('./apiRoute/uploadR2ApiRouter');


router.use('/', homePageRoutes);
router.use('/', profilePageRoutes);
router.use('/', insightsPageRoutes);
router.use('/', datasetPageRoutes);
router.use('/', chatbotPageRoutes);
router.use('/', dashboardPageRoutes);
router.use('/', comingsoonPageRoutes);
router.use('/', errorPageRoutes);

router.use('/', feedbackformRoutes);

router.use('/', insightsApiRoutes);
router.use('/', datasetApiRoutes);
router.use('/', chatbotApiRoutes);
router.use('/', uploadApiRoutes);

module.exports = router;