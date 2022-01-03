const responseUtils = require('../utils/responseUtils');
const Product = require('../models/product');

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response http response
 * @returns {Promise<*>} the solving promise
 */
const getAllProducts = async response => {
  const products = await Product.find({});
  return responseUtils.sendJson(response, products);
};

/**
 * Fetches and views the information of a single product
 * 
 * @param {http.ServerResponse} response
 * @param {string} productId
 * @returns {Promise<*>}
 */

const viewProduct = async (response, productId) => {
  const productById = await Product.findById(productId).exec();
  if (!productById) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, productById);
};

/**
 * If presented, updates the description and the image
 * accordingly for the product in question.
 * 
 * @param {http.ServerResponse} response
 * @param {string} productId
 * @param {object} productData (mongoose document object)
 * @returns {Promise<*>}
 */

const updateProduct = async (response, productId, productData) => {
  const productById = await Product.findById(productId).exec();
  if (!productById) return responseUtils.notFound(response);

  productById.name = productData.name;
  productById.price = productData.price;

  if (productData.description) {
    productById.description = productData.description;
  }

  if (productData.image) {
    productById.image = productData.image;
  }

  try {
    const updatedProduct = await productById.save();
    return responseUtils.sendJson(response, updatedProduct);
  } catch (error) {
    return responseUtils.badRequest(response, error);
  }
};

/**
 * Deletes the chosen product from the database
 * 
 * @param {http.ServerResponse} response
 * @param {string} productId
 * @returns {Promise<*>}
 */

const deleteProduct = async (response, productId) => {
  const productById = await Product.findById(productId).exec();
  if (!productById) return responseUtils.notFound(response);

  await Product.deleteOne({ _id: productId });
  return responseUtils.sendJson(response, productById);
};

/**
 * Creates a new product to the database with required information
 * 
 * @param {http.ServerResponse} response
 * @param {object} productData (mongoose document object)
 * @returns {Promise<*>}
 */

const registerProduct = async (response, productData) => {
  try {
    const newProduct = await new Product(productData).save();
    return responseUtils.createdResource(response, newProduct);
  } catch (err) {
    return responseUtils.badRequest(response, 'Validation error');
  }
};

module.exports = {
  getAllProducts,
  viewProduct,
  updateProduct,
  deleteProduct,
  registerProduct,
};
