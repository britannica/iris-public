
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const ERROR_DOCUMENT = process.env.ERROR_DOCUMENT;

const utils = {
  AmazonError: {
    NO_SUCH_KEY: 'NoSuchKey',
  },
  RedirectLocation: {
    NOT_FOUND: `${CLOUDFRONT_URL}/${ERROR_DOCUMENT}`,
  },


  /**
   * Redirect the HTTP response
   *
   * todo: validate location
   * todo: validate statusCode
   *
   * @param {Function}  callback      The lambda callback
   * @param {String}    location      URL to redirect to
   * @param {Number}    [statusCode]  HTTP status code; Default = 302; Temporary redirect
   * @returns {Object}
   */

  redirectResponse(callback, location, statusCode = 302) {
    const cacheControl = statusCode === 302 ? 'max-age=604800' : null;

    return callback(null, {
      statusCode,
      headers: {
        'Cache-Control': cacheControl,
        'Location': location,
      },
      body: '',
    });
  },


  /**
   * Determine if the given command is on the list of allowed sharp commands
   *
   * @param {String} command
   * @returns {boolean}
   */

  isValidCommand(command) {
    return [].indexOf(command) !== -1;
  }
};

module.exports = utils;
