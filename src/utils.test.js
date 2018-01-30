
const assert = require('chai').assert;
const utils = require('./utils');

describe('Utils', () => {
  describe('redirectResponse', () => {

  });

  describe('isValidCommand', () => {
    it('`any` should return `false`', () => {
      assert.strictEqual(utils.isValidCommand('any'), false);
    });

    it('`crop` should return `false`', () => {
      assert.strictEqual(utils.isValidCommand('crop'), false);
    });

    it('`greyscale` should return `false`', () => {
      assert.strictEqual(utils.isValidCommand('greyscale'), false);
    });
  });
});
