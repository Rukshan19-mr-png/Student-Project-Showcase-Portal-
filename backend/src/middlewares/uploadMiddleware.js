import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
]);

// Configure disk storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = allowedImageTypes.get(file.mimetype);
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

// Filter out non-image files
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedExtension = allowedImageTypes.get(file.mimetype);

  if (!expectedExtension) {
    const error = new Error('Only JPEG, PNG, GIF, and WebP images are allowed.');
    error.statusCode = 400;
    return cb(error, false);
  }

  const validExtensions = file.mimetype === 'image/jpeg' ? ['.jpg', '.jpeg'] : [expectedExtension];
  if (!validExtensions.includes(extension)) {
    const error = new Error('Uploaded file extension does not match its image type.');
    error.statusCode = 400;
    return cb(error, false);
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
