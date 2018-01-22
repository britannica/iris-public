'use strict';

const AWS = require('aws-sdk');
const Jimp = require('jimp');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const BUCKET = process.env.BUCKET;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const ERROR_DOCUMENT = process.env.ERROR_DOCUMENT;

const AmazonError = {
  NO_SUCH_KEY: 'NoSuchKey',
};

const RedirectLocation = {
  NOT_FOUND: `${CLOUDFRONT_URL}/${ERROR_DOCUMENT}`,
};


/**
 * Redirect the HTTP response
 *
 * @param {Function} callback       The lambda callback
 * @param {String} location         URL to redirect to
 * @param {Number} [statusCode]     HTTP status code; Default = Temporary redirect
 * @returns {Object}
 */

function redirectResponse(callback, location, statusCode = 302) {
  const cacheControl = statusCode === 302 ? 'max-age=604800' : null;

  return callback(null, {
    statusCode,
    headers: {
      'Cache-Control': cacheControl,
      'Location': location,
    },
    body: '',
  });
}


/**
 * Determine if the given command is on the list of allowed sharp commands
 *
 * @param {String} command
 * @returns {boolean}
 */

function isValidCommand(command) {
  return [].indexOf(command) !== -1;
}


/**
 * The resize function to be deployed to Lambda
 *
 * todo: ensure height and width are numbers
 * todo: disallow decimals
 *
 * @param {Object}    event
 * @param {Object}    context
 * @param {Function}  callback
 * @returns {*}
 */

module.exports.resizeImage = (event, context, callback) => {
  const key = event.queryStringParameters.key;
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
              image.scaleToFit(width, height);
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
};
