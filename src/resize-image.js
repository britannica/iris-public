
const AWS = require('aws-sdk');
const sharp = require('sharp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const utils = require('./utils');
const { requestCropHints, getExtractOptions } = require('./crop-utils');
const { Command, ImageQuality, Param, MimeType } = require('./constants');
const { buildResponse, getImageQuality, getDimensions, getCommand, logger } = utils;
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
  return new Promise((returnToHandler) => {
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


    // Redirect to the original image if there are no valid parameters

    if (params.filter(param => param.isValid === true).length === 0) {
      return returnToHandler(buildResponse(imagePath));
    }


    // Continue image manipulation procedure

    S3.getObject({ Bucket: BUCKET, Key: imagePath })
      .promise()
      .then(async data => {
        const image = sharp(data.Body);
        const mimeType = data.ContentType;

        switch (mimeType) {
          case MimeType.JPEG:
            image.withoutEnlargement();

            switch (command) {
              case Command.CROP:
                const annotateImageResponse = await requestCropHints(data.Body, width, height);
                const extractOptions = getExtractOptions(annotateImageResponse);

                image.extract(extractOptions);

                break;

              case Command.DEFAULT:
              default:
                image.max();
            }

            if (height && width) {
              image.resize(width, height);
            }

            return image
              .toFormat('jpg')
              .jpeg({ quality })
              .toBuffer()
              .then(buffer => Promise.resolve({ buffer, mimeType }));

          case MimeType.GIF:
          default:
            // Pass control back to the Lambda handler
            // Redirect GIFs back to their original version without resizing
            // todo: add animation detection https://www.npmjs.com/package/animated-gif-detector

            return returnToHandler(buildResponse(imagePath));
        }
      })


      // Write the new, resized image back to S3

      .then(({ buffer, mimeType }) => S3.putObject({
        ACL: 'public-read',
        Body: buffer,
        Bucket: BUCKET,
        CacheControl: 'public, max-age=31536000',
        ContentType: mimeType,
        Key: key,
      }).promise())


      // Return a permanent redirect to the new image

      .then(() => {
        logger.info('Image manipulation successful.');
        logger.info(params);

        return returnToHandler(buildResponse(key, 301));
      })


      // Wah wah...

      .catch((err) => {
        logger.info(err);

        return returnToHandler(buildResponse());
      });
  });
}

module.exports = resizeImage;
