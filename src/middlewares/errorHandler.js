const AppError = require('../utils/AppError');

// STUB - replaced by Khalid's TOOL-19
// Global error handler mapping everything to consistent JSON errors.
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  if (err && err.type === 'entity.parse.failed') { // malformed JSON body
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid JSON body' } });
  }
  if (err && err.name === 'ValidationError') { // Mongoose
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
  if (err && err.name === 'CastError') { // Mongoose
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'invalid id' } });
  }
  if (err && err.code === 11000) { // duplicate key
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'duplicate value violates a unique constraint' } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'internal server error' } });
};
