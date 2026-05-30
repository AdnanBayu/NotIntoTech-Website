// Controller for all Insights (articles) actions.
// Handles both page rendering and API JSON responses.

const articleModel = require('../models/prisma/articleModel');
const categoryModel = require('../models/prisma/categoryModel');

///////////////////// Page Controllers /////////////////////

/*
 GET /insights
 Render the insights listing page.
*/
exports.showInsightsPage = async (req, res) => {
  const PAGE_LIMIT = 9;
  const page = parseInt(req.query.page) || 1;

  try {
    const { articles, count } = await articleModel.getPublishedArticles({ page, limit: PAGE_LIMIT });

    res.render('insights/page-insights', {
      articles,
      pagination: {
        page,
        pages: Math.ceil((count || 0) / PAGE_LIMIT),
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching insights page:', error);
    res.render('insights/page-insights', {
      articles: [],
      pagination: { page: 1, pages: 0, total: 0 },
    });
  }
};

/*
 GET /insights/:slug
 Render a single article detail page.
*/
exports.showInsightDetail = async (req, res) => {
  try {
    const article = await articleModel.getPublishedArticleBySlug(req.params.slug);

    if (!article) {
      return res.status(404).render('error', {
        error: 'Article not found',
        message: "The article you're looking for doesn't exist.",
      });
    }

    // Increment view count
    article.views = await articleModel.incrementViews(article.id, article.views);

    // Format date for display
    article.updated_at = article.updated_at instanceof Date
      ? article.updated_at.toISOString().split('T')[0]
      : 'Unknown';

    res.render('insights/insights-detail', { article });
  } catch (error) {
    console.error('Error fetching insight detail:', error);
    res.status(500).render('error', {
      error: 'Failed to load article',
      message: error.message,
    });
  }
};

///////////////////// Public API Controllers /////////////////////

/*
 GET /api/insights
 Return a paginated list of published articles as JSON.
*/
exports.getArticles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { articles, count } = await articleModel.getPublishedArticles({ page, limit });
    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
};

/*
 GET /api/insights/:slug
 Return a single published article with incremented view count.
*/
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await articleModel.getPublishedArticleBySlug(req.params.slug);

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    article.views = await articleModel.incrementViews(article.id, article.views);

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch article' });
  }
};

/*
 GET /api/insights/category/:category
 Return published articles filtered by category.
*/
exports.getArticlesByCategory = async (req, res) => {
  try {
    const articles = await articleModel.getPublishedArticlesByCategory(req.params.category);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
};

/*
 GET /api/categories
 Return all article categories.
*/
exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

///////////////////// Admin API Controllers /////////////////////

/*
 GET /api/insights-admin/all
 Return all articles including drafts (admin only).
 Middleware: isAdmin
*/
exports.getAllArticlesAdmin = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  try {
    const { articles, count } = await articleModel.getAllArticles({ page, limit, status });
    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
};

/*
 POST /api/insights
 Create a new article (admin only).
 Middleware: isAdmin, validateArticleCreate, handleValidationErrors, sanitizeArticle
*/
exports.createArticle = async (req, res) => {
  try {
    const {
      title, content, category, excerpt, tags, author,
      tableauUrl, seoMetaDescription, seoKeywords, featuredImage,
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Ensure slug is unique
    const existing = await articleModel.findArticleBySlug(slug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An article with this title already exists',
      });
    }

    // Find or create the category
    const categoryId = category
      ? (await categoryModel.upsertCategory(category)).id
      : null;

    const article = await articleModel.createArticle({
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
      status_rel: { connect: { name: 'draft' } },
      ...(tableauUrl ? { tableau: { create: { tableau_url: tableauUrl } } } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ success: false, error: 'Failed to create article' });
  }
};

/*
 PUT /api/insights/:id
 Update an article (admin only). Status changes are blocked here.
 Middleware: isAdmin, validateArticleUpdate, handleValidationErrors, sanitizeArticle
*/
exports.updateArticle = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Block status changes via PUT — use /publish and /unpublish endpoints instead
    delete updates.status;
    delete updates.publish_status;
    delete updates.status_rel;

    // Build snake_case update payload
    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.author !== undefined) payload.author = updates.author;
    if (updates.seoMetaDescription !== undefined) payload.seo_meta_description = updates.seoMetaDescription;
    if (updates.seoKeywords !== undefined) payload.seo_keywords = updates.seoKeywords;
    if (updates.featuredImage !== undefined) payload.featured_image = updates.featuredImage;

    if (updates.category !== undefined) {
      const cat = await categoryModel.upsertCategory(updates.category);
      payload.category_id = cat.id;
    }

    if (updates.tableauUrl !== undefined) {
      payload.tableau = {
        upsert: {
          create: { tableau_url: updates.tableauUrl || null },
          update: { tableau_url: updates.tableauUrl || null, updated_at: new Date() },
        },
      };
    }

    payload.updated_at = new Date();

    const article = await articleModel.updateArticle(req.params.id, payload);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article,
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ success: false, error: 'Failed to update article' });
  }
};

/*
 POST /api/insights/:id/publish
 Publish an article (admin only).
*/
exports.publishArticle = async (req, res) => {
  try {
    const article = await articleModel.publishArticle(req.params.id);
    res.json({ success: true, message: 'Article published successfully', data: article });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ success: false, error: 'Failed to publish article' });
  }
};

/*
 POST /api/insights/:id/unpublish
 Unpublish an article (admin only).
*/
exports.unpublishArticle = async (req, res) => {
  try {
    const article = await articleModel.unpublishArticle(req.params.id);
    res.json({ success: true, message: 'Article unpublished successfully', data: article });
  } catch (error) {
    console.error('Error unpublishing article:', error);
    res.status(500).json({ success: false, error: 'Failed to unpublish article' });
  }
};

/*
 DELETE /api/insights/:id
 Delete an article (admin only).
*/
exports.deleteArticle = async (req, res) => {
  try {
    const article = await articleModel.deleteArticle(req.params.id);
    res.json({ success: true, message: 'Article deleted successfully', data: { deletedId: article.id } });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
};
