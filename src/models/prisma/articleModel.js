// Data access layer for articles (Prisma / PostgreSQL)
// All prisma queries for article live here.

const { prisma } = require('../../database/prismaClient');

////////////// Shared includes //////////////

const ARTICLE_INCLUDE = {
  category_rel: true,
  status_rel: true,
  tableau: true,
};

////////////// Helpers //////////////

/**
 * Flatten Prisma relational fields.
 * @param {object} article Raw Prisma article record
 * @returns {object} Flat article object
 */
function formatArticle(article) {
  return {
    ...article,
    status: article.status_rel ? article.status_rel.name : null,
    category: article.category_rel ? article.category_rel.name : 'Other',
    tableau_url: article.tableau ? article.tableau.tableau_url : null,
  };
}

////////////// Public queries //////////////

/**
 * Retrieve a paginated list of published articles.
 * @param {{ page: number, limit: number }} options
 * @returns {{ articles: object[], count: number }}
 */
async function getPublishedArticles({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [articles, count] = await Promise.all([
    prisma.articles.findMany({
      where: { status_rel: { name: 'published' } },
      include: ARTICLE_INCLUDE,
      orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.articles.count({ where: { status_rel: { name: 'published' } } }),
  ]);
  return { articles: articles.map(formatArticle), count };
}

/**
 * Retrieve a single published article by slug.
 * @param {string} slug
 * @returns {object|null}
 */
async function getPublishedArticleBySlug(slug) {
  const article = await prisma.articles.findFirst({
    where: { slug, status_rel: { name: 'published' } },
    include: ARTICLE_INCLUDE,
  });
  return article ? formatArticle(article) : null;
}

/**
 * Retrieve published articles filtered by category name.
 * @param {string} categoryName
 * @returns {object[]}
 */
async function getPublishedArticlesByCategory(categoryName) {
  const articles = await prisma.articles.findMany({
    where: {
      category_rel: { name: categoryName },
      status_rel: { name: 'published' },
    },
    include: ARTICLE_INCLUDE,
    orderBy: { published_at: 'desc' },
  });
  return articles.map(formatArticle);
}

/**
 * Increment the view count of an article by 1.
 * @param {string} id - Article ID
 * @param {number} currentViews
 * @returns {number} New view count
 */
async function incrementViews(id, currentViews) {
  const newViews = (currentViews || 0) + 1;
  await prisma.articles.update({
    where: { id },
    data: { views: newViews },
  });
  return newViews;
}

////////////// Admin queries //////////////

/**
 * Check if a slug already exists (for uniqueness validation).
 * @param {string} slug
 * @returns {object|null}
 */
async function findArticleBySlug(slug) {
  return prisma.articles.findUnique({ where: { slug } });
}

/**
 * Retrieve all articles (including drafts) with pagination and optional status filter.
 * @param {{ page: number, limit: number, status?: string }} options
 * @returns {{ articles: object[], count: number }}
 */
async function getAllArticles({ page = 1, limit = 10, status } = {}) {
  const skip = (page - 1) * limit;
  const where = status ? { status_rel: { name: status } } : {};
  const [articles, count] = await Promise.all([
    prisma.articles.findMany({
      where,
      include: ARTICLE_INCLUDE,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.articles.count({ where }),
  ]);
  return { articles: articles.map(formatArticle), count };
}

/**
 * Create a new article.
 * @param {object} data - Prisma create payload
 * @returns {object} Formatted article
 */
async function createArticle(data) {
  const article = await prisma.articles.create({
    data,
    include: ARTICLE_INCLUDE,
  });
  return formatArticle(article);
}

/**
 * Update an article by ID.
 * @param {string} id
 * @param {object} data - Prisma update payload
 * @returns {object} Formatted article
 */
async function updateArticle(id, data) {
  const article = await prisma.articles.update({
    where: { id },
    data,
    include: ARTICLE_INCLUDE,
  });
  return formatArticle(article);
}

/**
 * Publish an article (set status to 'published').
 * @param {string} id
 * @returns {object} Formatted article
 */
async function publishArticle(id) {
  const article = await prisma.articles.update({
    where: { id },
    data: {
      status_rel: { connect: { name: 'published' } },
      published_at: new Date(),
      updated_at: new Date(),
    },
    include: ARTICLE_INCLUDE,
  });
  return formatArticle(article);
}

/**
 * Unpublish an article (set status back to 'draft').
 * @param {string} id
 * @returns {object} Formatted article
 */
async function unpublishArticle(id) {
  const article = await prisma.articles.update({
    where: { id },
    data: {
      status_rel: { connect: { name: 'draft' } },
      updated_at: new Date(),
    },
    include: ARTICLE_INCLUDE,
  });
  return formatArticle(article);
}

/**
 * Delete an article by ID.
 * @param {string} id
 * @returns {object} Deleted article record
 */
async function deleteArticle(id) {
  return prisma.articles.delete({ where: { id } });
}

module.exports = {
  formatArticle,
  getPublishedArticles,
  getPublishedArticleBySlug,
  getPublishedArticlesByCategory,
  incrementViews,
  findArticleBySlug,
  getAllArticles,
  createArticle,
  updateArticle,
  publishArticle,
  unpublishArticle,
  deleteArticle,
};
