
const assert = require('chai').assert;
const utils = require('./utils');
const { buildResponse, isValidCommand } = utils;

describe('utils', () => {
  describe('#buildResponse', () => {
    let response = {};

    beforeEach(() => {
      response = {};
    });

    it('should return the callback with `statusCode: 301`', () => {
      response = buildResponse('sesame street', 301);

      assert.strictEqual(response.statusCode, 301);
    });

    it('should return the callback with `statusCode: 302`', () => {
      response = buildResponse('sesame street');

      assert.strictEqual(response.statusCode, 302);
    });

    it('should return the callback with a Cache-Control header value of `null`', () => {
      response = buildResponse('sesame street', 301);

      assert.strictEqual(response.headers['Cache-Control'], null);
    });

    it('should return the callback with a Cache-Control header value of `max-age=604800`', () => {
      response = buildResponse('sesame street');

      assert.strictEqual(response.headers['Cache-Control'], 'max-age=604800');
    });
  });

  describe('#isValidCommand', () => {
    it('`any` should return `false`', () => {
      assert.strictEqual(isValidCommand('any'), false);
    });

    it('`crop` should return `false`', () => {
      assert.strictEqual(isValidCommand('crop'), false);
    });

    it('`greyscale` should return `false`', () => {
      assert.strictEqual(isValidCommand('greyscale'), false);
    });
  });
});
