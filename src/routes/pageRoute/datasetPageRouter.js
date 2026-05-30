const express           = require('express');
const router            = express.Router();
const datasetController = require('../../controllers/datasetController');

router.get('/dataset', datasetController.showDatasetPage);

module.exports = router;