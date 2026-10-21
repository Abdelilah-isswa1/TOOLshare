const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const installationRepository = require('../repositories/installationRepository');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

async function isInstalled() {
  const [marker, admins] = await Promise.all([
    installationRepository.exists(),
    userRepository.countAdmins(),
  ]);
  return marker || admins > 0;
}

function validate({ name, email, password }) {
  if (!name || !email || !password) throw new AppError(400, 'name, email and password are required');
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError(400, 'name, email and password must be strings');
  }
  if (!EMAIL_RE.test(email)) throw new AppError(400, 'email is not valid');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(400, `password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

async function install(input) {
  if (await isInstalled()) throw new AppError(409, 'system is already installed', 'ALREADY_INSTALLED');
  validate(input);

  // Atomic claim: two simultaneous installs cannot both pass this point.
  if (!(await installationRepository.claim())) {
    throw new AppError(409, 'system is already installed', 'ALREADY_INSTALLED');
  }
  try {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const admin = await userRepository.createAdmin({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    return { id: admin._id, email: admin.email, role: admin.role };
  } catch (err) {
    await installationRepository.release(); // let the user retry after a failure
    throw err;
  }
}

module.exports = { isInstalled, install };
