const mongoose = require('mongoose');
const responseUtils = require('../utils/responseUtils');
const Order = require('../models/order');

/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response http response
 * @returns {Promise<*>} the solving promise
 */
const getAllOrders = async response => {
  const orders = await Order.find({});
  return responseUtils.sendJson(response, orders);
};

/**
 * Send the orders of the Customer attempting to view them
 * 
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @returns {Promise<*>}
 */

const getOwnOrders = async (response, userId) => {
  const orders = await Order.find({ customerId: userId });
  return responseUtils.sendJson(response, orders);
};

/**
 * Views the details of a specific order, usable for Admin roles
 * 
 * @param {http.ServerResponse} response
 * @param {string} orderId
 * @returns {Promise<*>}
 */

const viewOrder = async (response, orderId) => {
  const orderById = await Order.findById(orderId).exec();
  if (!orderById) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, orderById);
};

/**
 * Views the details of a specific order, usable for Customer roles
 * 
 * @param {http.ServerResponse} response
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<*>}
 */

const viewOwnOrder = async (response, orderId, userId) => {
  const orderById = await Order.findOne({
    _id: orderId,
    customerId: userId,
  }).exec();
  if (!orderById) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, orderById);
};

/**
 * Takes in, checks and registers new orders made by the user
 * 
 * @param {http.ServerResponse} response
 * @param {object} orderData (mongoose document object)
 * @param {string} userId
 * @returns {Promise<*>}
 */

const registerOrder = async (response, orderData, userId) => {
  try {
    const newOrder = await new Order({
      customerId: mongoose.Types.ObjectId(userId),
      items: orderData.items,
    }).save();

    return responseUtils.createdResource(response, newOrder);
  } catch (err) {
    return responseUtils.badRequest(response, 'Validation error');
  }
};

module.exports = {
  getAllOrders,
  getOwnOrders,
  viewOrder,
  viewOwnOrder,
  registerOrder,
};
