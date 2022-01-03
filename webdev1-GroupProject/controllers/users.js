const responseUtils = require('../utils/responseUtils');
const User = require('../models/user');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response http response
 * @returns {Promise<*>} the solving promise
 */
const getAllUsers = async response => {
  const users = await User.find({});
  return responseUtils.sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId the users id
 * @param {object} currentUser (mongoose document object)
 * @returns {Promise<*>} the solving promise
 */
const deleteUser = async (response, userId, currentUser) => {
  if (userId === currentUser.id) {
    return responseUtils.badRequest(
      response,
      'Deleting own data is not allowed'
    );
  }

  const userById = await User.findById(userId).exec();
  if (!userById) return responseUtils.notFound(response);

  await User.deleteOne({ _id: userId });
  return responseUtils.sendJson(response, userById);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId the users id
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 * @returns {Promise<*>} the solving promise
 */
const updateUser = async (response, userId, currentUser, userData) => {
  if (userId === currentUser.id) {
    return responseUtils.badRequest(
      response,
      'Updating own data is not allowed'
    );
  }

  const userById = await User.findById(userId).exec();
  if (!userById) return responseUtils.notFound(response);

  // Updates only user's role
  userById.role = userData.role;

  try {
    return responseUtils.sendJson(response, await userById.save());
  } catch (error) {
    return responseUtils.badRequest(response, error);
  }
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} userId the users id
 * @param {object} currentUser (mongoose document object)
 * @returns {Promise<*>} the solving promise
 */
const viewUser = async (response, userId, currentUser) => {
  const userById = await User.findById(userId).exec();
  if (!userById) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, userById);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {object} userData JSON data from request body
 * @returns {Promise<*>} the solving promise
 */
const registerUser = async (response, userData) => {
  delete userData.role;

  try {
    const freshUser = await new User(userData).save();
    return responseUtils.createdResource(response, freshUser);
  } catch (err) {
    return responseUtils.badRequest(response, 'Validation error');
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser,
};
