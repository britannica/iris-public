
const winston = require('winston');
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
   * Retrieve image quality based on a valid image type
   *
   * @param {string} imageType
   * @returns {number}
   */

  getImageQuality(imageType) {
    if (Object.values(ImageType).indexOf(imageType) === -1) {
      logger.info('Invalid image type:', imageType);
      logger.info('Defaulting to image quality:', ImageQuality.DEFAULT);

      return ImageQuality.DEFAULT;
    }

    return ImageQuality[imageType];
  },


  /**
   * Retrieve a valid command
   *
   * @param {string} command
   * @returns {string}
   */

  getCommand(command) {
    if (Object.values(Command).indexOf(command) === -1) {
      logger.info('Invalid command:', command);
      logger.info('Defaulting to command:', Command.DEFAULT);

      return Command.DEFAULT;
    }

    return command;
  },
};

module.exports = utils;
