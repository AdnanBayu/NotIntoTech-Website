const express = require('express');
const router = express.Router();
const { prisma } = require('../database/prismaClient');

///////////////////// Display articles grid on page /////////////////////
router.get('/insights', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const [articles, count] = await Promise.all([
      prisma.articles.findMany({
        where: { status: 'published' },
        include: { category_rel: true },
        orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.articles.count({ where: { status: 'published' } }),
    ]);

    const formattedArticles = (articles || []).map(article => ({
      ...article,
      category: article.category_rel ? article.category_rel.name : 'Other'
    }));

    res.render('insights/page-insights', {
      articles: formattedArticles,
      pagination: {
        page,
        pages: Math.ceil((count || 0) / limit),
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.render('insights/page-insights', {
      articles: [],
      pagination: { page: 1, pages: 0, total: 0 },
    });
  }
});

///////////////////// Display single article page /////////////////////
router.get('/insights/:slug', async (req, res) => {
  try {
    const article = await prisma.articles.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      include: { category_rel: true, tableau: true },
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
    article.category = article.category_rel ? article.category_rel.name : 'Other';
    article.tableauUrl = article.tableau ? article.tableau.tableau_url : null;
    article.updated_at = (article.updated_at instanceof Date) ? article.updated_at.toISOString().split('T')[0] : 'Unknown';

    // To handle Date and String data type
    // article.updated_at = (article.updated_at instanceof Date)
    //   ? article.updated_at.toISOString().split('T')[0]
    //   : (typeof article.updated_at === 'string' ? article.updated_at.split('T')[0] : 'Unknown');

    res.render('insights/insights-detail', { article });
  } catch (error) {
    console.error('Error fetching insight single:', error);
    res.status(500).render('error', {
      error: 'Failed to load article',
      message: error.message
    });
  }
});

module.exports = router;