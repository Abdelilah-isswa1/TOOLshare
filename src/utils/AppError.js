class AppError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || message.replace(/\s+/g, '_').toUpperCase();
  }
}
module.exports = AppError;
