require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/toolshare',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
};
