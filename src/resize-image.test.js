
// Set environment variables before importing resizeImage
// todo: figure out a better way to set these...

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT });

const { logger } = require('./utils');
const resizeImage = require('./resize-image');

logger.transports['console.info'].silent = true;

// Tests

describe('resizeImage', () => {
  test('valid keys return permanent redirect to new object', (done) => {
    const validKey = '500x500/56/176256-131-5CEFC130.jpg';

    resizeImage(validKey)
      .then((response) => {
        testValidKey(response, validKey);
        done();
      });
  });

  test('invalid keys should return 404.html', (done) => {
    resizeImage('super-invalid-key')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  test('not found in S3 should return 404.html', (done) => {
    resizeImage('100x100/this-image-definitely-does-not-exist')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  test('invalid commands should return 404.html', (done) => {
    resizeImage('500x500:fake/56/176256-131-5CEFC130.jpg')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  test('valid commands should return permanent redirect to new object', (done) => {
      const validKeyWithCommand = '500x500:max/56/176256-131-5CEFC130.jpg';

      resizeImage(validKeyWithCommand)
        .then((response) => {
          testValidKey(response, validKeyWithCommand);
          done();
        });
    }
  );

  test('invalid dimensions should return 404.html when `height` exceeds maximum', (done) => {
      resizeImage('500x5000/56/176256-131-5CEFC130.jpg')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    }
  );

  test('invalid dimensions should return 404.html when `width` exceeds maximum', (done) => {
      resizeImage('5000x500/56/176256-131-5CEFC130.jpg')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    }
  );

  test('invalid file types should return original key for GIF', (done) => {
    const size = '500x500';
    const originalKey = '13/181513-131-4F074388.gif';

    resizeImage(`${size}/${originalKey}`)
      .then((response) => {
        expect(response.statusCode).toBe(302);
        expect(response.headers['Cache-Control']).toBe('max-age=604800');
        expect(response.headers['Location']).toBe(`${CLOUDFRONT_URL}/${originalKey}`);
        done();
      });
  });
});


/**
 * Run tests against the default response
 *
 * @param {Object} response
 */

function testDefaultResponse(response) {
  expect(response.statusCode).toBe(302);
  expect(response.headers['Cache-Control']).toBe('max-age=604800');
  expect(response.headers['Location']).toBe(`${CLOUDFRONT_URL}/${ERROR_DOCUMENT}`);
}


/**
 * Run tests against a response that is processing a valid key
 *
 * @param {Object} response
 * @param {String} key
 */

function testValidKey(response, key) {
  expect(response.statusCode).toBe(301);
  expect(response.headers['Cache-Control']).toBe(null);
  expect(response.headers['Location']).toBe(`${CLOUDFRONT_URL}/${key}`);
}
