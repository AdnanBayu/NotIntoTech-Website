// Validation rules for article creation
const { body, validationResult } = require('express-validator');

const validateArticleCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),

  body('category')
    .optional()
    .isIn(['Technology', 'Business', 'Political', 'Other'])
    .withMessage('Invalid category'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom(value => {
      if (value && !Array.isArray(value)) return false;
      if (value && value.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),

  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Author name must be max 100 characters'),

  body('seoMetaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('Meta description must be max 160 characters'),

  body('seoKeywords')
    .optional()
    .isArray().withMessage('Keywords must be an array'),
];

const validateArticleUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),

  body('category')
    .optional()
    .isIn(['Technology', 'Business', 'Political', 'Other'])
    .withMessage('Invalid category'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = {
  validateArticleCreate,
  validateArticleUpdate,
  handleValidationErrors
};