const express = require('express');
const router = express.Router();
const { prisma } = require('../database/prismaClient');

router.get('/dataset', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const [datasets, count] = await Promise.all([
            prisma.datasets.findMany({
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            prisma.datasets.count(),
        ]);

        res.render('page-dataset', {
            datasets: datasets || [],
            pagination: {
                page,
                pages: Math.ceil((count || 0) / limit),
                total: count || 0,
            },
            message: null,
            error: null
        });
    } catch (err) {
        console.error('Unexpected error in dataset route:', err);
        res.render('page-dataset', {
            datasets: [],
            pagination: { page: 1, pages: 0, total: 0 },
            message: null,
            error: 'Failed to load datasets'
        });
    }
});

module.exports = router;