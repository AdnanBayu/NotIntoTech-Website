// Backend router for dataset api

const express = require('express');
const router = express.Router();
const { prisma } = require('../database/prismaClient');
const { isAdmin } = require('../middleware/authMiddleware');
const {
  validateDatasetCreate,
  validateDatasetUpdate,
  handleValidationErrors
} = require('../middleware/validateDataset');

// PUBLIC API ROUTES (Read-only)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
// GET /api/datasets
router.get('/api/datasets', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [datasets, count] = await Promise.all([
      prisma.datasets.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.datasets.count(),
    ]);

    res.json({
      success: true,
      data: datasets,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({
      success: false, error: 'Failed to fetch datasets',
    });
    // expose error message for debugging
    // res.status(500).json({
    //   success: false,
    //   error: error.message,
    // })
  }
});

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
 *         description: The ID of the dataset
 *     responses:
 *       200:
 *         description: A single dataset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dataset'
 *       400:
 *         description: Invalid dataset ID
 *       404:
 *         description: Dataset not found
 *       500:
 *         description: Internal server error
 */
// GET /api/datasets/:id
router.get('/api/datasets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
    }

    const dataset = await prisma.datasets.findUnique({
      where: { id },
    });

    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }

    res.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dataset' });
  }
});


// ADMIN API ROUTES - Secured by auth

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
 *                 description: Title of the dataset
 *               description:
 *                 type: string
 *                 description: Short description of the dataset
 *               coverImageUrl:
 *                 type: string
 *                 description: URL for the cover image
 *               fileUrl:
 *                 type: string
 *                 description: URL for downloading the dataset file
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
// POST /api/datasets
router.post(
  '/api/datasets',
  isAdmin,
  validateDatasetCreate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, description, coverImageUrl, fileUrl } = req.body;

      const dataset = await prisma.datasets.create({
        data: {
          title,
          description: description || null,
          cover_image_url: coverImageUrl || null,
          file_url: fileUrl,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Dataset created successfully',
        data: dataset
      });
    } catch (error) {
      console.error('Error creating dataset:', error);
      res.status(500).json({ success: false, error: 'Failed to create dataset' });
    }
  }
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch datasets
 */
// GET /api/datasets-admin/all
router.get('/api/datasets-admin/all', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [datasets, count] = await Promise.all([
      prisma.datasets.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.datasets.count(),
    ]);

    res.json({
      success: true,
      data: datasets,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin datasets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch datasets' });
  }
});

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
 *         description: The ID of the dataset
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
// PUT /api/datasets/:id
router.put(
  '/api/datasets/:id',
  isAdmin,
  validateDatasetUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
      }

      const updates = { ...req.body };

      // Map camelCase to snake_case
      const updatePayload = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.coverImageUrl !== undefined) updatePayload.cover_image_url = updates.coverImageUrl;
      if (updates.fileUrl !== undefined) updatePayload.file_url = updates.fileUrl;

      // Note: schema model has cover_image_url and file_url as the only non-standard snake_case columns.

      const dataset = await prisma.datasets.update({
        where: { id },
        data: updatePayload,
      });

      if (!dataset) {
        return res.status(404).json({ success: false, error: 'Dataset not found' });
      }

      res.json({
        success: true,
        message: 'Dataset updated successfully',
        data: dataset
      });
    } catch (error) {
      console.error('Error updating dataset:', error);
      res.status(500).json({ success: false, error: 'Failed to update dataset' });
    }
  }
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
 *         description: The ID of the dataset
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
// DELETE /api/datasets/:id
router.delete('/api/datasets/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
    }

    const dataset = await prisma.datasets.delete({
      where: { id },
    });

    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }

    res.json({
      success: true,
      message: 'Dataset deleted successfully',
      data: { deletedId: dataset.id }
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to delete dataset' });
  }
});

module.exports = router;
