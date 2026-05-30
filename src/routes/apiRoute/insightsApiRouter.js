// Backend router for insights (articles) API.
// All @swagger JSDoc comments are kept here so Swagger auto-discovery still works.
// Business logic lives in insightsController.js — this file only wires routes + middleware.

const express            = require('express');
const router             = express.Router();
const { isAdmin }        = require('../../middleware/authMiddleware');
const sanitizeArticle    = require('../../middleware/sanitizeArticle');
const {
  validateArticleCreate,
  validateArticleUpdate,
  handleValidationErrors,
} = require('../../middleware/validateArticle');
const insightsController = require('../../controllers/insightsController');

///////////////////// PUBLIC API ROUTES /////////////////////

/**
 * @swagger
 * /api/insights:
 *   get:
 *     summary: Retrieve a list of published articles
 *     tags: [Insights]
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
 *         description: Number of articles per page
 *     responses:
 *       200:
 *         description: A list of published articles
 *       500:
 *         description: Internal server error
 */
router.get('/api/insights', insightsController.getArticles);

/**
 * @swagger
 * /api/insights/category/{category}:
 *   get:
 *     summary: Retrieve published articles filtered by category
 *     tags: [Insights]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of articles in the specified category
 *       500:
 *         description: Internal server error
 */
router.get('/api/insights/category/:category', insightsController.getArticlesByCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve all article categories
 *     tags: [Insights]
 *     responses:
 *       200:
 *         description: A list of categories
 *       500:
 *         description: Internal server error
 */
router.get('/api/categories', insightsController.getCategories);

/**
 * @swagger
 * /api/insights/{slug}:
 *   get:
 *     summary: Retrieve a single published article by slug
 *     tags: [Insights]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single article with incremented view count
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/insights/:slug', insightsController.getArticleBySlug);

///////////////////// ADMIN API ROUTES (Secured by auth) /////////////////////

/**
 * @swagger
 * /api/insights:
 *   post:
 *     summary: Create a new article (Admin only)
 *     tags: [Insights]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               author:
 *                 type: string
 *               tableauUrl:
 *                 type: string
 *               seoMetaDescription:
 *                 type: string
 *               seoKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               featuredImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Validation error or duplicate title
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create article
 */
router.post(
  '/api/insights',
  isAdmin,
  validateArticleCreate,
  handleValidationErrors,
  sanitizeArticle,
  insightsController.createArticle
);

/**
 * @swagger
 * /api/insights-admin/all:
 *   get:
 *     summary: Retrieve all articles including drafts (Admin only)
 *     tags: [Insights]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *     responses:
 *       200:
 *         description: A list of articles
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch articles
 */
router.get('/api/insights-admin/all', isAdmin, insightsController.getAllArticlesAdmin);

/**
 * @swagger
 * /api/insights/{id}:
 *   put:
 *     summary: Update an existing article (Admin only)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to update article
 */
router.put(
  '/api/insights/:id',
  isAdmin,
  validateArticleUpdate,
  handleValidationErrors,
  sanitizeArticle,
  insightsController.updateArticle
);

/**
 * @swagger
 * /api/insights/{id}/publish:
 *   post:
 *     summary: Publish an article (Admin only)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article published successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to publish article
 */
router.post('/api/insights/:id/publish', isAdmin, insightsController.publishArticle);

/**
 * @swagger
 * /api/insights/{id}/unpublish:
 *   post:
 *     summary: Unpublish an article (Admin only)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article unpublished successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to unpublish article
 */
router.post('/api/insights/:id/unpublish', isAdmin, insightsController.unpublishArticle);

/**
 * @swagger
 * /api/insights/{id}:
 *   delete:
 *     summary: Delete an article (Admin only)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete article
 */
router.delete('/api/insights/:id', isAdmin, insightsController.deleteArticle);

module.exports = router;