const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subfolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  ensureDir(dir);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const documentUpload = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { avatarUpload, documentUpload, UPLOAD_ROOT };
