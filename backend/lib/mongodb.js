const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (global._mongoPromise) return global._mongoPromise;

  const uri = MONGO_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  global._mongoPromise = mongoose.connect(uri, { });
  await global._mongoPromise;
  return mongoose;
}

module.exports = { connectToDatabase };
