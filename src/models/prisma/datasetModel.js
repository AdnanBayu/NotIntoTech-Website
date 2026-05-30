// Data access layer for datasets (Prisma / PostgreSQL)
// All prisma queries for datasets live here.

const { prisma } = require('../../database/prismaClient');

/**
 * Retrieve a paginated list of all datasets.
 * @param {{ page: number, limit: number }} options
 * @returns {{ datasets: object[], count: number }}
 */
async function getDatasets({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [datasets, count] = await Promise.all([
    prisma.datasets.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.datasets.count(),
  ]);
  return { datasets, count };
}

/**
 * Retrieve a single dataset by its integer ID.
 * @param {number} id
 * @returns {object|null}
 */
async function getDatasetById(id) {
  return prisma.datasets.findUnique({ where: { id } });
}

/**
 * Create a new dataset record.
 * @param {{ title: string, description?: string, coverImageUrl?: string, fileUrl: string }} data
 * @returns {object} Created dataset
 */
async function createDataset({ title, description, coverImageUrl, fileUrl }) {
  return prisma.datasets.create({
    data: {
      title,
      description: description || null,
      cover_image_url: coverImageUrl || null,
      file_url: fileUrl,
    },
  });
}

/**
 * Update a dataset by ID.
 * Accepts camelCase keys and maps them to snake_case Prisma fields.
 * @param {number} id
 * @param {{ title?: string, description?: string, coverImageUrl?: string, fileUrl?: string }} updates
 * @returns {object} Updated dataset
 */
async function updateDataset(id, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.coverImageUrl !== undefined) payload.cover_image_url = updates.coverImageUrl;
  if (updates.fileUrl !== undefined) payload.file_url = updates.fileUrl;

  return prisma.datasets.update({ where: { id }, data: payload });
}

/**
 * Delete a dataset by ID.
 * @param {number} id
 * @returns {object} Deleted dataset record
 */
async function deleteDataset(id) {
  return prisma.datasets.delete({ where: { id } });
}

module.exports = {
  getDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset,
};
