const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');
const { isAdmin } = require('../middleware/authMiddleware');
const sanitizeArticle = require('../middleware/sanitizeArticle');
const { 
  validateArticleCreate, 
  validateArticleUpdate, 
  handleValidationErrors 
} = require('../middleware/validateArticle');

// Standardized select query with aliases to maintain compatibility
const ARTICLE_SELECT = 'id, title, slug, content, excerpt, category, tags, author, featuredImage:featured_image, seoMetaDescription:seo_meta_description, seoKeywords:seo_keywords, status, tableauUrl:tableau_url, views, publishedAt:published_at, createdAt:created_at, updatedAt:updated_at';

// ============================================
// PUBLIC API ROUTES (Read-only)
// ============================================

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
// GET /api/insights
router.get('/api/insights', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (countError) throw countError;

    const { data: articles, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
});

// GET /api/insights/:slug
router.get('/api/insights/:slug', async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Increment views
    const newViews = (article.views || 0) + 1;
    await supabase.from('articles').update({ views: newViews }).eq('id', article.id);
    article.views = newViews;

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch article' });
  }
});

// GET /api/insights/category/:category
router.get('/api/insights/category/:category', async (req, res) => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('category', req.params.category)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
});

// ============================================
// ADMIN API ROUTES (CRUD) - Protected by auth
// ============================================

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
// POST /api/insights
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
      const { data: existingArticle } = await supabase.from('articles').select('id').eq('slug', slug).single();
      if (existingArticle) {
        return res.status(400).json({ 
          success: false, 
          error: 'An article with this title already exists' 
        });
      }

      const { data: article, error } = await supabase
        .from('articles')
        .insert([{
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 150),
          category: category || 'Other',
          tags: tags || [],
          author: author || 'NITE Team',
          tableau_url: tableauUrl || null,
          seo_meta_description: seoMetaDescription || excerpt || content.substring(0, 160),
          seo_keywords: seoKeywords || [],
          featured_image: featuredImage || null,
          status: 'draft',
        }])
        .select(ARTICLE_SELECT)
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        message: 'Article created successfully',
        data: article 
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
// GET /api/insights-admin/all
router.get('/api/insights-admin/all', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = supabase.from('articles').select('*', { count: 'exact' });
    if (status) {
      query = query.eq('status', status);
    }
    
    // Get count first
    const { count, error: countError } = await query;
    if (countError) throw countError;

    // Get data
    let dataQuery = supabase.from('articles').select(ARTICLE_SELECT).order('created_at', { ascending: false }).range(skip, skip + limit - 1);
    if (status) {
      dataQuery = dataQuery.eq('status', status);
    }

    const { data: articles, error } = await dataQuery;
    if (error) throw error;

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
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
// PUT /api/insights/:id
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
      
      // Map camelCase back to snake_case for Supabase
      const updatePayload = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.content !== undefined) updatePayload.content = updates.content;
      if (updates.category !== undefined) updatePayload.category = updates.category;
      if (updates.excerpt !== undefined) updatePayload.excerpt = updates.excerpt;
      if (updates.tags !== undefined) updatePayload.tags = updates.tags;
      if (updates.author !== undefined) updatePayload.author = updates.author;
      if (updates.tableauUrl !== undefined) updatePayload.tableau_url = updates.tableauUrl;
      if (updates.seoMetaDescription !== undefined) updatePayload.seo_meta_description = updates.seoMetaDescription;
      if (updates.seoKeywords !== undefined) updatePayload.seo_keywords = updates.seoKeywords;
      if (updates.featuredImage !== undefined) updatePayload.featured_image = updates.featuredImage;

      updatePayload.updated_at = new Date().toISOString();

      const { data: article, error } = await supabase
        .from('articles')
        .update(updatePayload)
        .eq('id', req.params.id)
        .select(ARTICLE_SELECT)
        .single();

      if (error || !article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ 
        success: true, 
        message: 'Article updated successfully',
        data: article 
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
// POST /api/insights/:id/publish
router.post('/api/insights/:id/publish', isAdmin, async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .update({ 
        status: 'published', 
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(ARTICLE_SELECT)
      .single();

    if (error || !article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ 
      success: true, 
      message: 'Article published successfully',
      data: article 
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ success: false, error: 'Failed to publish article' });
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
// POST /api/insights/:id/unpublish
router.post('/api/insights/:id/unpublish', isAdmin, async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .update({ 
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(ARTICLE_SELECT)
      .single();

    if (error || !article) {
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
// DELETE /api/insights/:id
router.delete('/api/insights/:id', isAdmin, async (req, res) => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .single();

    if (error || !article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ 
      success: true, 
      message: 'Article deleted successfully',
      data: { deletedId: article.id }
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
});

// Note: Visualizations specific endpoints /visualizations are omitted here because
// we rely on the main PUT endpoint with tableauUrl.

module.exports = router;