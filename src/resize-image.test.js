
// Set environment variables before importing resizeImage
// todo: figure out a better way to set these...

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT });


// Require stuff after setting environment variables

const assert = require('chai').assert;
const resizeImage = require('./resize-image');

describe('resizeImage', () => {
  const validKey = '500x500/56/176256-131-5CEFC130.jpg';

  describe('valid keys', () => {
    it('return permanent redirect to new object', (done) => {
      resizeImage(validKey)
        .then((response) => {
          assert.strictEqual(response.statusCode, 301);
          assert.strictEqual(response.headers['Cache-Control'], null);
          assert.strictEqual(response.headers['Location'], `${CLOUDFRONT_URL}/${validKey}`);
          done();
        });
    });
  });

  describe('invalid keys', () => {
    it('should return 404.html', (done) => {
      resizeImage('super-invalid-key')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    });
  });

  describe('not found in S3', () => {
    it('should return 404.html', (done) => {
      resizeImage('100x100/this-image-definitely-does-not-exist')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    });
  });

  describe('invalid commands', () => {
    it('should return 404.html', (done) => {
      resizeImage('500x500@fake/56/176256-131-5CEFC130.jpg')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    });
  });

  describe('invalid dimensions', () => {
    it('should return 404.html when `height` exceeds maximum', (done) => {
      resizeImage('500x5000/56/176256-131-5CEFC130.jpg')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    });

    it('should return 404.html when `width` exceeds maximum', (done) => {
      resizeImage('5000x500/56/176256-131-5CEFC130.jpg')
        .then((response) => {
          testDefaultResponse(response);
          done();
        });
    });
  });

  describe('invalid file types', () => {
    it('should return original key for GIF', (done) => {
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
