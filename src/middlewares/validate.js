// STUB - replaced by Khalid's TOOL-19
// Minimal validation middleware: `check` receives the request and returns an
// error message string (400) or null.
module.exports = (check) => (req, res, next) => {
  const error = check(req);
  if (error) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error } });
  }
  next();
};
