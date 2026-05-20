const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { isAdmin } = require('../middleware/authMiddleware');

// Ensure upload directory exists (used for local fallback)
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudflare R2 Credentials check
const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const isR2Configured = !!(accountId && accessKeyId && secretAccessKey);

let s3Client = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey
    }
  });
}

// File filter (accept images and datasets/documents)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file extension. Allowed extensions are images and standard documents/datasets.'));
  }
};

// Use Memory Storage so file is held in RAM during R2/Fallback logic
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper: Formats public URL base properly with protocol and trailing slash handling
function formatPublicUrl(urlBase, filename) {
  if (!urlBase) return `/uploads/${filename}`;

  let base = urlBase.trim();
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = 'https://' + base;
  }
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  return `${base}/${filename}`;
}

/**
 * @swagger
 * /api/upload:
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
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 fileUrl:
 *                   type: string
 *                   description: Public URL of the uploaded file
 *                 fileName:
 *                   type: string
 *                   description: Original file name
 *                 size:
 *                   type: integer
 *                   description: File size in bytes
 *       400:
 *         description: No file uploaded or unsupported file extension
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to save file
 */
// Single file upload route
// Expects form field name: "file"
// Query params: ?type=dataset OR ?type=article
router.post('/api/r2upload', isAdmin, (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = uniqueSuffix + ext;

    try {
      if (isR2Configured && s3Client) {
        const type = req.query.type || 'dataset';
        let bucketName = '';
        let publicUrlBase = '';

        // Select the bucket and domain based on resource type
        if (type === 'article') {
          bucketName = process.env.CLOUDFLARE_R2_ARTICLE_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME;
          publicUrlBase = process.env.CLOUDFLARE_R2_ARTICLE_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL;
        } else {
          bucketName = process.env.CLOUDFLARE_R2_DATASET_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME;
          publicUrlBase = process.env.CLOUDFLARE_R2_DATASET_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL;
        }

        // Final fallback if specific variables are missing
        if (!bucketName) {
          bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'notintotech-datasets';
        }

        // Determine content type
        let contentType = 'application/octet-stream';
        if (req.file.mimetype) {
          contentType = req.file.mimetype;
        } else if (ext === '.csv') {
          contentType = 'text/csv';
        } else if (['.jpg', '.jpeg'].includes(ext)) {
          contentType = 'image/jpeg';
        } else if (ext === '.png') {
          contentType = 'image/png';
        } else if (ext === '.svg') {
          contentType = 'image/svg+xml';
        }

        const uploadParams = {
          Bucket: bucketName,
          Key: filename,
          Body: req.file.buffer,
          ContentType: contentType
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const fileUrl = formatPublicUrl(publicUrlBase, filename);

        console.log(`Successfully uploaded ${filename} to R2 bucket "${bucketName}". Public URL: ${fileUrl}`);

        return res.json({
          success: true,
          message: 'File uploaded to Cloudflare R2 successfully',
          fileUrl: fileUrl,
          fileName: req.file.originalname,
          size: req.file.size
        });
      } else {
        // Graceful fallback to local disk storage
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        const fileUrl = `/uploads/${filename}`;
        console.log(`R2 credentials not set or incomplete. Saved ${filename} to local storage. URL: ${fileUrl}`);

        return res.json({
          success: true,
          message: 'File uploaded to local storage successfully (R2 Fallback)',
          fileUrl: fileUrl,
          fileName: req.file.originalname,
          size: req.file.size
        });
      }
    } catch (storageErr) {
      console.error('File storage/upload error:', storageErr);
      return res.status(500).json({
        success: false,
        error: `Failed to save file: ${storageErr.message}`
      });
    }
  });
});

module.exports = router;