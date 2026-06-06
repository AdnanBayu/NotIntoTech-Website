// Backend router for datasets API.
// All @swagger JSDoc comments are kept here so Swagger auto-discovery still works.
// Business logic lives in datasetController.js — this file only wires routes + middleware.

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/authMiddleware');
const {
  validateDatasetCreate,
  validateDatasetUpdate,
  handleValidationErrors,
} = require('../../middleware/validateDataset');
const datasetController = require('../../controllers/datasetController');

///////////////////// PUBLIC API ROUTES /////////////////////

/**
 * @swagger
 * /api/datasets:
 *   get:
 *     summary: Retrieve a list of datasets
 *     tags: [Datasets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of datasets per page
 *     responses:
 *       200:
 *         description: A list of datasets
 *       500:
 *         description: Internal server error
 */
router.get('/api/datasets', datasetController.getDatasets);

/**
 * @swagger
 * /api/datasets/{id}:
 *   get:
 *     summary: Retrieve a single dataset by ID
 *     tags: [Datasets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single dataset
 *       400:
 *         description: Invalid dataset ID
 *       404:
 *         description: Dataset not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/datasets/:id', datasetController.getDatasetById);

///////////////////// ADMIN API ROUTES (Secured by auth) /////////////////////

/**
 * @swagger
 * /api/datasets:
 *   post:
 *     summary: Create a new dataset (Admin only)
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - fileUrl
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImageUrl:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dataset created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create dataset
 */
router.post(
  '/api/datasets',
  isAdmin,
  validateDatasetCreate,
  handleValidationErrors,
  datasetController.createDataset
);

/**
 * @swagger
 * /api/datasets-admin/all:
 *   get:
 *     summary: Retrieve a list of all datasets (Admin only)
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of datasets
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch datasets
 */
router.get('/api/datasets-admin/all', isAdmin, datasetController.getAllDatasetsAdmin);

/**
 * @swagger
 * /api/datasets/{id}:
 *   put:
 *     summary: Update an existing dataset (Admin only)
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImageUrl:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dataset updated successfully
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dataset not found
 *       500:
 *         description: Failed to update dataset
 */
router.put(
  '/api/datasets/:id',
  isAdmin,
  validateDatasetUpdate,
  handleValidationErrors,
  datasetController.updateDataset
);

/**
 * @swagger
 * /api/datasets/{id}:
 *   delete:
 *     summary: Delete a dataset (Admin only)
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dataset deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dataset not found
 *       500:
 *         description: Failed to delete dataset
 */
router.delete('/api/datasets/:id', isAdmin, datasetController.deleteDataset);

module.exports = router;