const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: `$PATH/.env` }); // in path

/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  return process.env.DBURL || 'mongodb://localhost:27017/WebShopDb';
};

/**
 * 
 * Connects to the database if it hasn't already been done
 * 
 * */

function connectDB() {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true,
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * 
 * Handles error if they are to occur
 * 
 * @param {Error} err
 */

function handleCriticalError(err) {
  console.error(err);
  throw err;
}

/**
 * 
 * Disconnects the database
 * 
 * */

function disconnectDB() {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
