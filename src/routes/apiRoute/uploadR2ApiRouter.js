// Router for file uploads to Cloudflare R2 (or local fallback).
// All multer config, S3 client setup, and upload logic live in uploadController.js.

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/authMiddleware');
const uploadController = require('../../controllers/uploadController');

/**
 * @swagger
 * /api/r2upload:
 *   post:
 *     summary: Upload a file to Cloudflare R2 or local storage (Admin only)
 *     description: >
 *       Uploads a single file. If Cloudflare R2 credentials are configured,
 *       the file is uploaded to R2. Otherwise, falls back to local disk storage.
 *       Allowed file types: .png, .jpg, .jpeg, .gif, .svg, .csv, .xlsx, .xls, .json, .txt, .pdf.
 *       Maximum file size: 10MB.
 *     tags: [R2 Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dataset, article]
 *           default: dataset
 *         description: Resource type — determines which R2 bucket to use
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or unsupported file extension
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to save file
 */
router.post('/api/r2upload', isAdmin, uploadController.uploadFile);

module.exports = router;