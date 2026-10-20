const crypto = require('crypto');

// Generates a short, URL-safe, unique reservation reference, e.g. TS-8F3K2Q.
function generateReference(prefix = 'TS') {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let body = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i += 1) body += alphabet[bytes[i] % alphabet.length];
  return `${prefix}-${body}`;
}
module.exports = { generateReference };
