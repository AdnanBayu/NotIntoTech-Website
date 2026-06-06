// Controller for file uploads to Cloudflare R2 (or local fallback).
// Multer setup and S3 client initialization live here.

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

///////////////////// Upload directory (local fallback) /////////////////////

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

///////////////////// Cloudflare R2 Client /////////////////////

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const isR2Configured = !!(accountId && accessKeyId && secretAccessKey);

let s3Client = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

///////////////////// Multer configuration /////////////////////

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file extension.'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

///////////////////// Helpers Reformat URL /////////////////////

function formatPublicUrl(urlBase, filename) {
  if (!urlBase) return `/uploads/${filename}`;
  let base = urlBase.trim();
  if (!base.startsWith('http://') && !base.startsWith('https://')) base = 'https://' + base;
  if (base.endsWith('/')) base = base.slice(0, -1);
  return `${base}/${filename}`;
}

///////////////////// Controller /////////////////////

/*
 POST /api/r2upload
 Upload a single file to Cloudflare R2, or local disk as fallback.
 Query params: ?type=dataset (default) | ?type=article
 Middleware: isAdmin (applied in route)
*/
exports.uploadFile = (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // create auto generated filename to prevent file collision in server and for security reason
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = uniqueSuffix + ext;

    try {
      if (isR2Configured && s3Client) {
        const type = req.query.type || 'dataset';

        let bucketName = '';
        let publicUrlBase = '';

        if (type === 'article') {
          bucketName = process.env.CLOUDFLARE_R2_ARTICLE_BUCKET_NAME;
          publicUrlBase = process.env.CLOUDFLARE_R2_ARTICLE_PUBLIC_URL;
        } else {
          bucketName = process.env.CLOUDFLARE_R2_DATASET_BUCKET_NAME;
          publicUrlBase = process.env.CLOUDFLARE_R2_DATASET_PUBLIC_URL;
        }

        // Resolve content type
        let contentType = req.file.mimetype || 'application/octet-stream';
        if (!req.file.mimetype) {
          if (ext === '.csv') contentType = 'text/csv';
          else if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
          else if (ext === '.png') contentType = 'image/png';
          else if (ext === '.svg') contentType = 'image/svg+xml';
        }

        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: req.file.buffer,
          ContentType: contentType,
        }));

        const fileUrl = formatPublicUrl(publicUrlBase, filename);
        console.log(`Uploaded ${filename} to R2 bucket "${bucketName}". URL: ${fileUrl}`);

        return res.json({
          success: true,
          message: 'File uploaded to Cloudflare R2 successfully',
          fileUrl,
          fileName: req.file.originalname,
          size: req.file.size,
        });
      }

      // Local disk fallback
      else {
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/${filename}`;
        console.log(`R2 not configured. Saved ${filename} to local storage. URL: ${fileUrl}`);

        return res.json({
          success: true,
          message: 'File uploaded to local storage (Fallback)',
          fileUrl,
          fileName: req.file.originalname,
          size: req.file.size,
        });
      }

    } catch (storageErr) {
      console.error('File storage/upload error:', storageErr);
      return res.status(500).json({ success: false, error: `Failed to save file: ${storageErr.message}` });
    }
  });
};