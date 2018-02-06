
const utils = require('./utils');
const { buildResponse, isValidCommand } = utils;

describe('utils', () => {
  describe('#buildResponse', () => {
    let response = {};

    beforeEach(() => {
      response = {};
    });

    test('should return the callback with `statusCode: 301`', () => {
      response = buildResponse('sesame street', 301);

      expect(response.statusCode).toBe(301);
    });

    test('should return the callback with `statusCode: 302`', () => {
      response = buildResponse('sesame street');

      expect(response.statusCode).toBe(302);
    });

    test(
      'should return the callback with a Cache-Control header value of `null`',
      () => {
        response = buildResponse('sesame street', 301);

        expect(response.headers['Cache-Control']).toBe(null);
      }
    );

    test(
      'should return the callback with a Cache-Control header value of `max-age=604800`',
      () => {
        response = buildResponse('sesame street');

        expect(response.headers['Cache-Control']).toBe('max-age=604800');
      }
    );
  });

  describe('#isValidCommand', () => {
    test('`max` should return `true`', () => {
      expect(isValidCommand('max')).toBe(true);
    });

    test('`crop` should return `false`', () => {
      expect(isValidCommand('crop')).toBe(false);
    });

    test('`greyscale` should return `false`', () => {
      expect(isValidCommand('greyscale')).toBe(false);
    });
  });
});
