// Backend router for article api

const express = require('express');
const router = express.Router();
const { prisma } = require('../database/prismaClient');
const { isAdmin } = require('../middleware/authMiddleware');
const sanitizeArticle = require('../middleware/sanitizeArticle');
const {
  validateArticleCreate,
  validateArticleUpdate,
  handleValidationErrors
} = require('../middleware/validateArticle');

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
router.get('/api/insights', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [articles, count] = await Promise.all([
      prisma.articles.findMany({
        where: { status: 'published' },
        include: { category_rel: true, tableau: true },
        orderBy: { published_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.articles.count({ where: { status: 'published' } }),
    ]);

    const formattedArticles = articles.map(article => ({
      ...article,
      category: article.category_rel ? article.category_rel.name : 'Other',
      tableau_url: article.tableau ? article.tableau.tableau_url : null
    }));

    res.json({
      success: true,
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
});

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
 *         description: The URL slug of the article
 *     responses:
 *       200:
 *         description: A single article with incremented view count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/insights/:slug', async (req, res) => {
  try {
    const article = await prisma.articles.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      include: { category_rel: true, tableau: true },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Increment views
    const newViews = (article.views || 0) + 1;
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: newViews },
    });
    article.views = newViews;

    const data = {
      ...article,
      category: article.category_rel ? article.category_rel.name : 'Other',
      tableau_url: article.tableau ? article.tableau.tableau_url : null
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

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
 *         description: The category name to filter by
 *     responses:
 *       200:
 *         description: A list of articles in the specified category
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
 *                     $ref: '#/components/schemas/Article'
 *       500:
 *         description: Internal server error
 */
router.get('/api/insights/category/:category', async (req, res) => {
  try {
    const articles = await prisma.articles.findMany({
      where: {
        category_rel: {
          name: req.params.category
        },
        status: 'published'
      },
      include: { category_rel: true, tableau: true },
      orderBy: { published_at: 'desc' },
    });

    const formattedArticles = articles.map(article => ({
      ...article,
      category: article.category_rel ? article.category_rel.name : 'Other',
      tableau_url: article.tableau ? article.tableau.tableau_url : null
    }));

    res.json({
      success: true,
      data: formattedArticles
    });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
});

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
// GET /api/categories
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.article_categories.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

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
 *                 description: Title of the article
 *               content:
 *                 type: string
 *                 description: Main content of the article
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
 *                 description: URL for the featured image
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Validation error or article with this title already exists
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
  async (req, res) => {
    try {
      const { title, content, category, excerpt, tags, author, tableauUrl, seoMetaDescription, seoKeywords, featuredImage } = req.body;

      // Auto-generate slug
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      // Check slug uniqueness
      const existingArticle = await prisma.articles.findUnique({ where: { slug } });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          error: 'An article with this title already exists'
        });
      }

      // Find or create category if name is provided
      let categoryId = null;
      if (category) {
        const cat = await prisma.article_categories.upsert({
          where: { name: category },
          update: {},
          create: { name: category }
        });
        categoryId = cat.id;
      }

      const article = await prisma.articles.create({
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 150),
          category_id: categoryId,
          tags: tags || [],
          author: author || 'NITE Team',
          seo_meta_description: seoMetaDescription || excerpt || content.substring(0, 160),
          seo_keywords: seoKeywords || [],
          featured_image: featuredImage || null,
          status: 'draft',
          // Create the tableau row if a URL was provided
          ...(tableauUrl ? {
            tableau: { create: { tableau_url: tableauUrl } }
          } : {}),
        },
        include: { category_rel: true, tableau: true }
      });

      // Flatten category and tableau_url for response
      const responseData = {
        ...article,
        category: article.category_rel ? article.category_rel.name : 'Other',
        tableau_url: article.tableau ? article.tableau.tableau_url : null
      };

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: responseData
      });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ success: false, error: 'Failed to create article' });
    }
  }
);

/**
 * @swagger
 * /api/insights-admin/all:
 *   get:
 *     summary: Retrieve a list of all articles including drafts (Admin only)
 *     tags: [Insights]
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
 *         description: Number of articles per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: A list of articles
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch articles
 */
router.get('/api/insights-admin/all', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [articles, count] = await Promise.all([
      prisma.articles.findMany({
        where,
        include: { category_rel: true, tableau: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.articles.count({ where }),
    ]);

    const formattedArticles = articles.map(article => ({
      ...article,
      category: article.category_rel ? article.category_rel.name : 'Other',
      tableau_url: article.tableau ? article.tableau.tableau_url : null
    }));

    res.json({
      success: true,
      data: formattedArticles,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
});

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
 *         description: The ID of the article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
  async (req, res) => {
    try {
      const updates = { ...req.body };
      delete updates.status; // Prevent status change via PUT

      // Map camelCase to snake_case and handle category
      const updatePayload = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.content !== undefined) updatePayload.content = updates.content;
      if (updates.excerpt !== undefined) updatePayload.excerpt = updates.excerpt;
      if (updates.tags !== undefined) updatePayload.tags = updates.tags;
      if (updates.author !== undefined) updatePayload.author = updates.author;
      if (updates.seoMetaDescription !== undefined) updatePayload.seo_meta_description = updates.seoMetaDescription;
      if (updates.seoKeywords !== undefined) updatePayload.seo_keywords = updates.seoKeywords;
      if (updates.featuredImage !== undefined) updatePayload.featured_image = updates.featuredImage;

      if (updates.category !== undefined) {
        const cat = await prisma.article_categories.upsert({
          where: { name: updates.category },
          update: {},
          create: { name: updates.category }
        });
        updatePayload.category_id = cat.id;
      }

      // Handle tableau_url via the related table
      if (updates.tableauUrl !== undefined) {
        updatePayload.tableau = {
          upsert: {
            create: { tableau_url: updates.tableauUrl || null },
            update: { tableau_url: updates.tableauUrl || null, updated_at: new Date() }
          }
        };
      }

      updatePayload.updated_at = new Date();

      const article = await prisma.articles.update({
        where: { id: req.params.id },
        data: updatePayload,
        include: { category_rel: true, tableau: true }
      });

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      const responseData = {
        ...article,
        category: article.category_rel ? article.category_rel.name : 'Other',
        tableau_url: article.tableau ? article.tableau.tableau_url : null
      };

      res.json({
        success: true,
        message: 'Article updated successfully',
        data: responseData
      });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ success: false, error: 'Failed to update article' });
    }
  }
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
 *         description: The ID of the article
 *     responses:
 *       200:
 *         description: Article published successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to publish article
 */
router.post('/api/insights/:id/publish', isAdmin, async (req, res) => {
  try {
    const article = await prisma.articles.update({
      where: { id: req.params.id },
      data: {
        status: 'published',
        published_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article published successfully',
      data: article
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish article'
    });
  }
});


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
 *         description: The ID of the article
 *     responses:
 *       200:
 *         description: Article unpublished successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to unpublish article
 */
router.post('/api/insights/:id/unpublish', isAdmin, async (req, res) => {
  try {
    const article = await prisma.articles.update({
      where: { id: req.params.id },
      data: {
        status: 'draft',
        updated_at: new Date(),
      },
    });

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({
      success: true,
      message: 'Article unpublished successfully',
      data: article
    });
  } catch (error) {
    console.error('Error unpublishing article:', error);
    res.status(500).json({ success: false, error: 'Failed to unpublish article' });
  }
});

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
 *         description: The ID of the article
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to delete article
 */
router.delete('/api/insights/:id', isAdmin, async (req, res) => {
  try {
    const article = await prisma.articles.delete({
      where: { id: req.params.id },
    });

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully',
      data: { deletedId: article.id }
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article'
    });
  }
});

module.exports = router;