const express = require('express');
const router = express.Router();
const { prisma } = require('../database/prismaClient');

// Display articles grid
router.get('/insights', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const [articles, count] = await Promise.all([
      prisma.articles.findMany({
        where: { status: 'published' },
        orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.articles.count({ where: { status: 'published' } }),
    ]);

    res.render('page-insights', {
      articles: articles || [],
      pagination: {
        page,
        pages: Math.ceil((count || 0) / limit),
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching insights list:', error);
    res.render('page-insights', {
      articles: [],
      pagination: { page: 1, pages: 0, total: 0 },
    });
  }
});

// Display single article
router.get('/insights/:slug', async (req, res) => {
  try {
    const article = await prisma.articles.findFirst({
      where: { slug: req.params.slug, status: 'published' },
    });

    if (!article) {
      return res.status(404).render('error', {
        error: 'Article not found',
        message: 'The article you\'re looking for doesn\'t exist.'
      });
    }

    // Increment views
    const newViews = (article.views || 0) + 1;
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: newViews },
    });

    article.views = newViews;

    res.render('insights-detail', { article });
  } catch (error) {
    console.error('Error fetching insight single:', error);
    res.status(500).render('error', {
      error: 'Failed to load article',
      message: error.message
    });
  }
});

module.exports = router;