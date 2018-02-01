
const assert = require('chai').assert;
const sinon = require('sinon');

// Set environment variables before importing resizeImage
// todo: figure out a better way to set these...

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT });

const resizeImage = require('./resize-image');

describe('resizeImage', () => {
  it('should show error document on invalid command', () => {
    resizeImage('500x500@fake/56/176256-131-5CEFC130.jpg')
      .then((response) => {
        assert.strictEqual(response.statusCode, 302);
      });
  });
});
