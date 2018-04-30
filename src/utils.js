
const winston = require('winston');
const _ = require('lodash');
const { Command, ImageQuality, ImageType } = require('./constants');

const { CLOUDFRONT_URL, ERROR_DOCUMENT } = process.env;
const logger = new winston.Logger();

logger.add(winston.transports.Console, {
  name: 'console.info',
  colorize: true,
  showLevel: true,
});

const utils = {
  logger,

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
   * todo: use Object.values after upgrading to node 8
   *
   * @param {String} command
   * @returns {boolean}
   */

  isValidCommand(command) {
    return _.values(Command).indexOf(command) !== -1;
  },


  /**
   * Validate that the dimension string conforms to the structure: 100x100
   *
   * @param {string} dimensions
   * @returns {boolean}
   */

  isValidDimensions(dimensions) {
    if (dimensions.indexOf('x') === -1) {
      return false;
    }

    const chunks = dimensions.split('x');

    if (chunks.length !== 2) {
      return false;
    }

    else if (Number.isNaN(parseInt(chunks[0]))) {
      return false;
    }

    else if (Number.isNaN(parseInt(chunks[1]))) {
      return false;
    }

    return true;
  },


  /**
   * Determine if the given image type is valid
   *
   * @param {string} imageType
   * @returns {boolean}
   */

  isValidImageType(imageType) {
    return _.values(ImageType).indexOf(imageType) !== -1;
  },


  /**
   * Retrieve height and width from a string
   *
   * @param {string} dimensions
   * @returns {Array<Number>}
   */

  getDimensions(dimensions) {
    if (!utils.isValidDimensions(dimensions)) {
      logger.info('Invalid dimensions:', dimensions);

      return [];
    }

    return dimensions.split('x').map(dimension => parseInt(dimension));
  },


  /**
   *
   * @param {string} imageType
   * @returns {number}
   */

  getImageQuality(imageType) {
    if (!utils.isValidImageType(imageType)) {
      logger.info('Invalid image type:', imageType);
      logger.info('Defaulting to image quality:', ImageQuality.DEFAULT);

      return ImageQuality.DEFAULT;
    }

    return ImageQuality[imageType];
  },
};

module.exports = utils;
