
const assert = require('chai').assert;
const sinon = require('sinon');
const utils = require('./utils');
const { redirectResponse, isValidCommand } = utils;

describe('Utils', () => {
  describe('redirectResponse', () => {
    const mockCallback = sinon.stub();

    beforeEach(() => {
      mockCallback.resetHistory();
    });

    it('should call the lambda `callback` function', () => {
      redirectResponse(mockCallback, 'sesame street');

      assert.strictEqual(mockCallback.called, true);
    });

    it('should return `null` as the first argument of the callback', () => {
      redirectResponse(mockCallback, 'sesame street');

      assert.strictEqual(mockCallback.args[0][0], null);
    });

    it('should return the callback with `statusCode: 301`', () => {
      redirectResponse(mockCallback, 'sesame street', 301);

      assert.strictEqual(mockCallback.args[0][1].statusCode, 301);
    });

    it('should return the callback with `statusCode: 302`', () => {
      redirectResponse(mockCallback, 'sesame street');

      assert.strictEqual(mockCallback.args[0][1].statusCode, 302);
    });

    it('should return the callback with a Cache-Control header value of `null`', () => {
      redirectResponse(mockCallback, 'sesame street', 301);

      assert.strictEqual(mockCallback.args[0][1].headers['Cache-Control'], null);
    });

    it('should return the callback with a Cache-Control header value of `max-age=604800`', () => {
      redirectResponse(mockCallback, 'sesame street');

      assert.strictEqual(mockCallback.args[0][1].headers['Cache-Control'], 'max-age=604800');
    });
  });

  describe('isValidCommand', () => {
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
