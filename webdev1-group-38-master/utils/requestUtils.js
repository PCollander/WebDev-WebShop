/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request http request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {
  const rawHeader = request.headers.authorization;
  if (!rawHeader) return null;

  const [authType, credentials] = rawHeader.split(' ');
  if (authType !== 'Basic') return null;

  const decodedCredentials = Buffer.from(credentials, 'base64')
    .toString('utf8')
    .split(':');

  return decodedCredentials.length === 2 ? decodedCredentials : null;
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true or false
 */
const acceptsJson = request => {
  const acceptHeader = request.headers.accept;
  if (!acceptHeader) return false;

  const parsedHeader = acceptHeader.split(',');
  return parsedHeader.some(
    value => value.includes('application/json') || value.includes('*/*')
  );
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true or false
 */
const isJson = request => {
  const acceptHeader = request.headers['content-type'];
  if (!acceptHeader) return false;

  const parsedHeader = acceptHeader.split(',');
  return parsedHeader.some(value => value === 'application/json');
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request http request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
