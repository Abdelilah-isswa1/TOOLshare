const Installation = require('../models/Installation');

const SINGLETON_ID = 'singleton';

module.exports = {
  exists: async () => (await Installation.countDocuments({ _id: SINGLETON_ID })) > 0,

  // Atomically claims the installation. Returns false if someone else already did.
  async claim() {
    try {
      await Installation.create({ _id: SINGLETON_ID });
      return true;
    } catch (err) {
      if (err && err.code === 11000) return false;
      throw err;
    }
  },

  release: () => Installation.deleteOne({ _id: SINGLETON_ID }),
};
