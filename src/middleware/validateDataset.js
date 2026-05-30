// Validation rules for dataset creation
const { body, validationResult } = require('express-validator');

const validateDatasetCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),

  body('coverImageUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && typeof value !== 'string') {
        throw new Error('Cover image URL must be a string');
      }
      return true;
    }),

  body('fileUrl')
    .trim()
    .notEmpty().withMessage('File URL is required')
    .custom((value) => {
      if (value && typeof value !== 'string') {
        throw new Error('File URL must be a string');
      }
      return true;
    }),
];

const validateDatasetUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),

  body('coverImageUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && typeof value !== 'string') {
        throw new Error('Cover image URL must be a string');
      }
      return true;
    }),

  body('fileUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && typeof value !== 'string') {
        throw new Error('File URL must be a string');
      }
      return true;
    }),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = {
  validateDatasetCreate,
  validateDatasetUpdate,
  handleValidationErrors
};
