
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const ERROR_DOCUMENT = process.env.ERROR_DOCUMENT;

const utils = {


  /**
   * Redirect the HTTP response
   *
   * todo: validate location as url
   * todo: validate statusCode as number and redirect
   *
   * @param {String}    filename      URL to redirect to
   * @param {Number}    [statusCode]  HTTP status code; Default = 302; Temporary redirect
   * @returns {Object}
   */

  buildResponse(filename = ERROR_DOCUMENT, statusCode = 302) {
    const cacheControl = statusCode === 302 ? 'max-age=604800' : null;

    return {
      statusCode,
      headers: {
        'Cache-Control': cacheControl,
        'Location': `${CLOUDFRONT_URL}/${filename}`,
      },
      body: '',
    };
  },


  /**
   * Determine if the given command is on the list of allowed sharp commands
   *
   * @param {String} command
   * @returns {boolean}
   */

  isValidCommand(command) {
    return ['max'].indexOf(command) !== -1;
  }
};

module.exports = utils;
