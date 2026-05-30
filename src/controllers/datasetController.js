// Controller for all Dataset actions.
// Handles both page rendering and API JSON responses.

const datasetModel = require('../models/prisma/datasetModel');

///////////////////// Page Controllers /////////////////////

/*
 GET /dataset
 Render the datasets listing page.
*/
exports.showDatasetPage = async (req, res) => {
  const PAGE_LIMIT = 9;
  const page = parseInt(req.query.page) || 1;

  try {
    const { datasets, count } = await datasetModel.getDatasets({ page, limit: PAGE_LIMIT });

    res.render('datasets/page-dataset', {
      datasets: datasets || [],
      pagination: {
        page,
        pages: Math.ceil((count || 0) / PAGE_LIMIT),
        total: count || 0,
      },
      message: null,
      error: null,
    });
  } catch (err) {
    console.error('Unexpected error in dataset page:', err);
    res.render('datasets/page-dataset', {
      datasets: [],
      pagination: { page: 1, pages: 0, total: 0 },
      message: null,
      error: 'Failed to load datasets',
    });
  }
};

///////////////////// Public API Controllers /////////////////////

/*
 GET /api/datasets
 Return a paginated list of datasets as JSON.
*/
exports.getDatasets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { datasets, count } = await datasetModel.getDatasets({ page, limit });
    res.json({
      success: true,
      data: datasets,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch datasets' });
  }
};

/*
 GET /api/datasets/:id
 Return a single dataset by its integer ID.
*/
exports.getDatasetById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
  }

  try {
    const dataset = await datasetModel.getDatasetById(id);
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }
    res.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dataset' });
  }
};

///////////////////// Admin API Controllers /////////////////////

/*
 GET /api/datasets-admin/all
 Return all datasets with pagination (admin only).
 Middleware: isAdmin
*/
exports.getAllDatasetsAdmin = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { datasets, count } = await datasetModel.getDatasets({ page, limit });
    res.json({
      success: true,
      data: datasets,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin datasets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch datasets' });
  }
};

/*
 POST /api/datasets
 Create a new dataset (admin only).
 Middleware: isAdmin, validateDatasetCreate, handleValidationErrors
*/
exports.createDataset = async (req, res) => {
  try {
    const { title, description, coverImageUrl, fileUrl } = req.body;
    const dataset = await datasetModel.createDataset({ title, description, coverImageUrl, fileUrl });
    res.status(201).json({ success: true, message: 'Dataset created successfully', data: dataset });
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to create dataset' });
  }
};

/*
 PUT /api/datasets/:id
 Update a dataset (admin only).
 Middleware: isAdmin, validateDatasetUpdate, handleValidationErrors
*/
exports.updateDataset = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
  }

  try {
    const dataset = await datasetModel.updateDataset(id, req.body);
    res.json({ success: true, message: 'Dataset updated successfully', data: dataset });
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to update dataset' });
  }
};

/*
 DELETE /api/datasets/:id
 Delete a dataset (admin only).
 Middleware: isAdmin
*/
exports.deleteDataset = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid dataset ID' });
  }

  try {
    const dataset = await datasetModel.deleteDataset(id);
    res.json({ success: true, message: 'Dataset deleted successfully', data: { deletedId: dataset.id } });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ success: false, error: 'Failed to delete dataset' });
  }
};
