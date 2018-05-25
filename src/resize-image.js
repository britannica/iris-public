
const AWS = require('aws-sdk');
const sharp = require('sharp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const { Command, ImageQuality, Param, MimeType } = require('./constants');
const { buildResponse, getImageQuality, getDimensions, getCommand, logger } = require('./utils');
const { requestCropHints, getExtractOptions } = require('./crop-utils');
const { performCommand } = require('./command-utils');
const { BUCKET } = process.env;

// todo: the crop operation for sharp is "extract"
// http://sharp.pixelplumbing.com/en/stable/api-operation/#extract


/**
 * Resize an image based on the values of the `key`
 *
 * `command` is a sharp command, defaults to `max`
 * http://sharp.pixelplumbing.com/en/stable/api-resize/
 * 
 * todo: ensure height and width are numbers
 * todo: disallow decimals
 *
 * @param {String} key
 * @returns {Promise}
 */

function resizeImage(key) {
  return new Promise(async (returnToHandler) => {
    // Take a string of params and turn them into an array of param objects

    const chunks = key.split(/\/(.*)/);
    const imagePath = chunks[1];
    const params = chunks[0]
      .split(',')
      .filter(param => param.indexOf(':') !== -1)
      .map((param) => {
        const paramChunks = param.split(':');

        return {
          type: paramChunks[0],
          value: paramChunks[1],
          isValid: false,
        };
      });


    // Set the params

    let command = Command.DEFAULT;
    let quality = ImageQuality.DEFAULT;
    let height = null;
    let width = null;

    params.map((param) => {
      switch (param.type) {
        case Param.COMMAND:
          command = getCommand(param.value);

          return Object.assign(param, {
            isValid: true,
          });

        case Param.SIZE:
          [width, height] = getDimensions(param.value);

          return Object.assign(param, {
            isValid: true,
          });

        case Param.TYPE:
          quality = getImageQuality(param.value);

          return Object.assign(param, {
            isValid: true,
          });
      }
    });

    // todo: document what's in this

    const imageConfig = {
      command,
      quality,
      height,
      width,
    };


    // Redirect to the original image if there are no valid parameters

    if (params.filter(param => param.isValid === true).length === 0) {
      return returnToHandler(buildResponse(imagePath));
    }


    // Continue image manipulation procedure

    try {
      const data = await S3.getObject({ Bucket: BUCKET, Key: imagePath }).promise();
      const mimeType = data.ContentType;
      let imageBuffer = null;

      switch (mimeType) {
        case MimeType.JPEG:
          imageBuffer = await performCommand(data.Body, imageConfig);

          break;

        case MimeType.GIF:
        default:
          // Pass control back to the Lambda handler
          // Redirect GIFs back to their original version without resizing
          // todo: add animation detection https://www.npmjs.com/package/animated-gif-detector

          return returnToHandler(buildResponse(imagePath));
      }


      // Write the new, resized image back to S3

      await S3.putObject({
        ACL: 'public-read',
        Body: imageBuffer,
        Bucket: BUCKET,
        CacheControl: 'public, max-age=31536000',
        ContentType: mimeType,
        Key: key,
      }).promise();


      // Return a permanent redirect to the new image

      logger.info('Successfully manipulated image:', imagePath);
      logger.info(params);

      return returnToHandler(buildResponse(key, 301));
    }


    // Wah wah...

    catch (err) {
      logger.info(err);

      return returnToHandler(buildResponse());
    }
  });
}

module.exports = resizeImage;
