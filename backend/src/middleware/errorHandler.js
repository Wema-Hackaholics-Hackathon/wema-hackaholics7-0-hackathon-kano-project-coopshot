function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: err.errors?.[0]?.message || 'Duplicate value' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors?.[0]?.message || 'Validation error' });
  }

  // Multer file-size/type errors (from fileFilter or limits) are client mistakes, not server faults
  if (err.name === 'MulterError' || /only image files are allowed/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message || 'Invalid file upload' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };
