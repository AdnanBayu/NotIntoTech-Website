// Data access layer for article categories (Prisma / PostgreSQL)
// All prisma queries for article categories live here.

const { prisma } = require('../../database/prismaClient');

/**
 * Retrieve all article categories, ordered alphabetically.
 * @returns {object[]}
 */
async function getAllCategories() {
  return prisma.article_categories.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Find a category by name, or create it if it doesn't exist.
 * @param {string} name
 * @returns {object} Category record
 */
async function upsertCategory(name) {
  return prisma.article_categories.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

module.exports = {
  getAllCategories,
  upsertCategory,
};
