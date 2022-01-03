const responseUtils = require('./utils/responseUtils');
const { acceptsJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser,
} = require('./controllers/users');
const {
  getAllProducts,
  viewProduct,
  updateProduct,
  deleteProduct,
  registerProduct,
} = require('./controllers/products');
const {
  getAllOrders,
  getOwnOrders,
  viewOrder,
  viewOwnOrder,
  registerOrder,
} = require('./controllers/orders');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET', 'POST'],
  '/api/orders': ['GET', 'POST'],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response http response
 */
const sendOptions = (filePath, response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
    'Access-Control-Allow-Headers': 'Content-Type,Accept',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'Content-Type,Accept',
  });
  return response.end();
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix prefix for url
 * @returns {boolean} true or false
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true or false
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 * 
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 * 
 */

const matchProductId = url => {
  return matchIdRoute(url, 'products');
};

/**
 * 
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 * 
 */

const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
};

/**
 * 
 * Provides the filename from the path
 * 
 * @param {string} filePath pathname of the request URL
 * @returns {string}
 */

const fileNameFromPath = filePath =>
  filePath === '/' || filePath === '' ? 'index.html' : filePath;

/**
 * 
 * Provides the users id from the path
 * 
 * @param {string} filePath pathname of the request URL
 * @returns {string}
 */

const idFromPath = filePath => {
  const splitPath = filePath.split('/');
  return splitPath[splitPath.length - 1];
};

/**
 * 
 * Provides the filepath from the request
 * 
 * @param {http.IncomingMessage} request
 * @returns {string}
 */

const requestFilePath = request => {
  const { url, headers } = request;
  return new URL(url, `http://${headers.host}`).pathname;
};

/**
 * 
 * Checks if the user is Admin or not and allows or doesn't allow them to
 * delete, add or modify the other users information based on the role check.
 * 
 * @param {string} filePath pathname of the request URL
 * @param {string} method
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {Promise<*>}
 */

const userActionsById = async (filePath, method, request, response) => {
  const userId = idFromPath(filePath);

  const currentuser = await getCurrentUser(request);
  if (!currentuser) return responseUtils.basicAuthChallenge(response);
  if (currentuser.role !== 'admin') return responseUtils.forbidden(response);

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (method === 'GET') {
    return await viewUser(response, userId, currentuser);
  } else if (method === 'PUT') {
    const body = await parseBodyJson(request);
    return await updateUser(response, userId, currentuser, body);
  } else if (method === 'DELETE') {
    if (currentuser.id !== userId) {
      return await deleteUser(response, userId, currentuser);
    } else {
      return responseUtils.badRequest(response, "You can't delete yourself!");
    }
  } else {
    return responseUtils.methodNotAllowed(response);
  }
};

/**
 * 
 * Checks if the user is Admin or not and allows or doesn't allow them to
 * delete, add or modify products and their information based on the role 
 * check. Users with the role Customer can only view (GET) the products.
 * 
 * @param {string} filePath pathname of the request URL
 * @param {string} method
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {Promise<*>}
 */

const productActionsById = async (filePath, method, request, response) => {
  const productId = idFromPath(filePath);

  const currentuser = await getCurrentUser(request);
  if (!currentuser) return responseUtils.basicAuthChallenge(response);
  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (method === 'GET') {
    return await viewProduct(response, productId);
  }
  if (currentuser.role !== 'admin') return responseUtils.forbidden(response);

  if (method === 'PUT') {
    const body = await parseBodyJson(request);
    return await updateProduct(response, productId, body);
  } else if (method === 'DELETE') {
    return await deleteProduct(response, productId);
  } else {
    return responseUtils.methodNotAllowed(response);
  }
};

/**
 * 
 * Provides information of either the users own orders or all the orders
 * based on the role of the user.
 * 
 * @param {string} filePath pathname of the request URL
 * @param {string} method
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {Promise<*>}
 */

const orderActionsById = async (filePath, method, request, response) => {
  const orderId = idFromPath(filePath);

  const currentuser = await getCurrentUser(request);
  if (!currentuser) return responseUtils.basicAuthChallenge(response);
  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (method === 'GET') {
    if (currentuser.role !== 'admin')
      return await viewOwnOrder(response, orderId, currentuser._id);
    return await viewOrder(response, orderId);
  } else {
    return responseUtils.methodNotAllowed(response);
  }
};

/**
 * 
 * Parses the request and calls helper functions to carry out the tasks the 
 * user wishes to.
 * 
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {Promise<*>}
 */

const handleRequest = async (request, response) => {
  const { method: rawMethod } = request;
  const method = rawMethod.toUpperCase();
  const filePath = requestFilePath(request);

  // serve static files from public/ and return immediately
  if (method === 'GET' && !filePath.startsWith('/api')) {
    const fileName = await fileNameFromPath(filePath);
    return renderPublic(fileName, response);
  }
  return await serveAPIroutes(filePath, method, request, response);
};

/**
 * 
 * Acts based on the API routes and carries out the users requests based
 * on their rights and uses helper functions (controllers) to do them.
 * 
 * @param {string} filePath pathname of the request URL
 * @param {string} method
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {Promise<*>}
 */

const serveAPIroutes = async (filePath, method, request, response) => {
  if (matchUserId(filePath)) {
    return userActionsById(filePath, method, request, response);
  }

  if (matchProductId(filePath)) {
    return productActionsById(filePath, method, request, response);
  }

  if (matchOrderId(filePath)) {
    return orderActionsById(filePath, method, request, response);
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method === 'OPTIONS') return sendOptions(filePath, response);

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method)) {
    return responseUtils.methodNotAllowed(response);
  }

  // register new user
  if (filePath === '/api/register' && method === 'POST') {
    let body;
    try {
      body = await parseBodyJson(request);
    } catch (err) {
      return responseUtils.badRequest(response, 'Invalid request body');
    }
    return await registerUser(response, body);
  }

  const user = await getCurrentUser(request);
  if (!user) return responseUtils.basicAuthChallenge(response);

  // register new product
  if (filePath === '/api/products' && method === 'POST') {
    if (user.role !== 'admin') return responseUtils.forbidden(response);

    let body;
    try {
      body = await parseBodyJson(request);
    } catch (err) {
      return responseUtils.badRequest(response, 'Invalid request body');
    }
    return await registerProduct(response, body);
  }

  // register new order
  if (filePath === '/api/orders' && method === 'POST') {
    if (user.role !== 'customer') return responseUtils.forbidden(response);

    let body;
    try {
      body = await parseBodyJson(request);
    } catch (err) {
      return responseUtils.badRequest(response, 'Invalid request body');
    }
    return await registerOrder(response, body, user._id);
  }

  // GET all users
  if (filePath === '/api/users' && method === 'GET') {
    if (user.role !== 'admin') return responseUtils.forbidden(response);
    return await getAllUsers(response);
  }

  // GET all products
  if (filePath === '/api/products' && method === 'GET') {
    return await getAllProducts(response);
  }

  // GET all orders
  if (filePath === '/api/orders' && method === 'GET') {
    if (user.role !== 'admin') return await getOwnOrders(response, user._id);

    return await getAllOrders(response);
  }
};

module.exports = { handleRequest };
