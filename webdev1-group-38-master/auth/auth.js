const { getCredentials } = require('../utils/requestUtils');
const User = require('../models/user');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request the request of the action
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */

const getCurrentUser = async request => {
  const credentials = getCredentials(request);
  if (!credentials) return null;

  const [email, password] = credentials;

  const user = await User.findOne({ email: email }).exec();
  if (!user) return null;

  if (await user.checkPassword(password)) {
    return user;
  } else {
    return null;
  }
};

module.exports = { getCurrentUser };
