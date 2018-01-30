
const AWS = require('aws-sdk');
const Jimp = require('jimp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const utils = require('./utils');
const BUCKET = process.env.BUCKET;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const { redirectResponse, isValidCommand, RedirectLocation, AmazonError } = utils;


/**
 * Resize an image based on the values of the `key`
 * 
 * todo: ensure height and width are numbers
 * todo: disallow decimals
 *
 * @param {String} key
 * @param {Function} callback
 * @returns {Object}
 */

function resizeImage(key, callback) {
  const rectangle = key.match(/(\d+)x(\d+)\/(.*)/);
  const rectangleWithCommand = key.match(/(\d+)x(\d+)@(.*?)\/(.*)/);

  let height;
  let width;
  let imagePath;
  let command;


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

      return redirectResponse(callback, RedirectLocation.NOT_FOUND);
    }
  }


  // No match...

  else {
    console.log('Invalid key:', key);

    return redirectResponse(callback, RedirectLocation.NOT_FOUND);
  }


  // Disallow dimensions outside of 1920x1080

  if (width > 1920) {
    console.log('Dimensions too large:', width, height);

    return redirectResponse(callback, RedirectLocation.NOT_FOUND);
  }

  if (height > 1080) {
    console.log('Dimensions too large:', width, height);

    return redirectResponse(callback, RedirectLocation.NOT_FOUND);
  }


  // Key matched, continue resize procedure

  S3.getObject({ Bucket: BUCKET, Key: imagePath })
    .promise()
    .then(data => new Promise((resolve, reject) => {
      const mimeType = data.ContentType;

      switch (mimeType) {
        case Jimp.MIME_JPEG:
          Jimp.read(data.Body)
            .then((image) => {
              if (image.bitmap.height > height || image.bitmap.width > width) {
                image.scaleToFit(width, height);
              }

              image.quality(60);
              image.getBuffer(mimeType, (err, buffer) => resolve({ buffer, mimeType }));
            });

          break;
        case Jimp.MIME_GIF:
          // Redirect GIFs back to their original version, ignoring any resizing
          // todo: add animation detection https://www.npmjs.com/package/animated-gif-detector

          return redirectResponse(callback, `${CLOUDFRONT_URL}/${imagePath}`);
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

    .then(() => redirectResponse(callback, `${CLOUDFRONT_URL}/${key}`, 301))


    // Wah wah...

    .catch((err) => {
      switch (err.code) {
        // Redirect to the generic "Not Found" page if the original image doesn't exist in S3

        case AmazonError.NO_SUCH_KEY:
          return redirectResponse(callback, RedirectLocation.NOT_FOUND);

        default:
          console.error(err);

          return redirectResponse(callback, RedirectLocation.NOT_FOUND);
      }
    });
}

module.exports = resizeImage;
