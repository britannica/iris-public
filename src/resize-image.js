
const AWS = require('aws-sdk');
const sharp = require('sharp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const utils = require('./utils');
const { buildResponse, isValidCommand } = utils;
const BUCKET = process.env.BUCKET;

const MimeType = {
  GIF: 'image/gif',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
};


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
    const rectangle = key.match(/(\d+)x(\d+)\/(.*)/);
    const rectangleWithCommand = key.match(/(\d+)x(\d+):(.*?)\/(.*)/);

    let height;
    let width;
    let imagePath;
    let command = 'max';


    // 100x100/path/to/image

    if (Array.isArray(rectangle)) {
      width = parseInt(rectangle[1]);
      height = parseInt(rectangle[2]);
      imagePath = rectangle[3];
    }


    // 100x100@max/path/to/image

    else if (Array.isArray(rectangleWithCommand)) {
      width = parseInt(rectangleWithCommand[1]);
      height = parseInt(rectangleWithCommand[2]);
      command = rectangleWithCommand[3];
      imagePath = rectangleWithCommand[4];


      // Make sure command is valid...

      if (!isValidCommand(command)) {
        console.log('Invalid command:', command);

        return returnToHandler(buildResponse());
      }
    }


    // No match...

    else {
      console.log('Invalid key:', key);

      return returnToHandler(buildResponse());
    }


    // Disallow dimensions outside of 1920x1080

    if (width > 1920) {
      console.log('Dimensions too large:', width, height);

      return returnToHandler(buildResponse());
    }

    if (height > 1080) {
      console.log('Dimensions too large:', width, height);

      return returnToHandler(buildResponse());
    }


    // Key matched, continue resize procedure

    S3.getObject({ Bucket: BUCKET, Key: imagePath })
      .promise()
      .then(data => new Promise((resolve) => {
        const image = sharp(data.Body);
        const mimeType = data.ContentType;

        switch (mimeType) {
          case MimeType.JPEG:
            image
              .withoutEnlargement()
              .resize(width, height);

            switch (command) {
              case 'max':
              default:
                image[command]();
            }

            return image
              .toFormat('jpg')
              .jpeg({ quality: 60 })
              .toBuffer()
              .then(buffer => resolve({ buffer, mimeType }));

          case MimeType.GIF:
          default:
            // Pass control back to the Lambda handler
            // Redirect GIFs back to their original version without resizing
            // todo: add animation detection https://www.npmjs.com/package/animated-gif-detector

            return returnToHandler(buildResponse(imagePath));
        }
      }))


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

      .then(() => returnToHandler(buildResponse(key, 301)))


      // Wah wah...

      .catch((err) => {
        console.log(err);

        return returnToHandler(buildResponse());
      });
  });
}

module.exports = resizeImage;
