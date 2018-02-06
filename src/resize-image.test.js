
// Set environment variables before importing resizeImage
// todo: figure out a better way to set these...

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT });


// Require stuff after setting environment variables

const assert = require('chai').assert;
const { logger } = require('./utils');
const resizeImage = require('./resize-image');


// Put logging on silent mode

logger.transports['console.info'].silent = true;


// Tests

describe('resizeImage', () => {
  it('valid keys return permanent redirect to new object', (done) => {
    const validKey = '500x500/56/176256-131-5CEFC130.jpg';

    resizeImage(validKey)
      .then((response) => {
        testValidKey(response, validKey);
        done();
      });
  });

  it('invalid keys should return 404.html', (done) => {
    resizeImage('super-invalid-key')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  it('not found in S3 should return 404.html', (done) => {
    resizeImage('100x100/this-image-definitely-does-not-exist')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  it('invalid commands should return 404.html', (done) => {
    resizeImage('500x500:fake/56/176256-131-5CEFC130.jpg')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  it('valid commands should return permanent redirect to new object', (done) => {
    const validKeyWithCommand = '500x500:max/56/176256-131-5CEFC130.jpg';

    resizeImage(validKeyWithCommand)
      .then((response) => {
        testValidKey(response, validKeyWithCommand);
        done();
      });
  });

  it('invalid dimensions should return 404.html when `height` exceeds maximum', (done) => {
    resizeImage('500x5000/56/176256-131-5CEFC130.jpg')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  it('invalid dimensions should return 404.html when `width` exceeds maximum', (done) => {
    resizeImage('5000x500/56/176256-131-5CEFC130.jpg')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  it('invalid file types should return original key for GIF', (done) => {
    const size = '500x500';
    const originalKey = '13/181513-131-4F074388.gif';

    resizeImage(`${size}/${originalKey}`)
      .then((response) => {
        assert.strictEqual(response.statusCode, 302);
        assert.strictEqual(response.headers['Cache-Control'], 'max-age=604800');
        assert.strictEqual(response.headers['Location'], `${CLOUDFRONT_URL}/${originalKey}`);
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
  assert.strictEqual(response.statusCode, 302);
  assert.strictEqual(response.headers['Cache-Control'], 'max-age=604800');
  assert.strictEqual(response.headers['Location'], `${CLOUDFRONT_URL}/${ERROR_DOCUMENT}`);
}


/**
 * Run tests against a response that is processing a valid key
 *
 * @param {Object} response
 * @param {String} key
 */

function testValidKey(response, key) {
  assert.strictEqual(response.statusCode, 301);
  assert.strictEqual(response.headers['Cache-Control'], null);
  assert.strictEqual(response.headers['Location'], `${CLOUDFRONT_URL}/${key}`);
}
