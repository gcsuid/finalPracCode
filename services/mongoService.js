const mongoose = require('mongoose');
const config = require('../config/env');

async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
}

module.exports = {
  connectToMongo
};
