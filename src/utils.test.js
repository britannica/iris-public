
const utils = require('./utils');
const { buildResponse, isValidCommand, isValidDimensions, isValidImageType, getImageQuality, getDimensions } = utils;

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

  describe('#isValidDimensions', () => {
    test('`100x100` should return `false`', () => {
      expect(isValidDimensions('100x100')).toBe(true);
    });

    test('`BxB` should return `false`', () => {
      expect(isValidDimensions('BxB')).toBe(false);
    });

    test('`100x` should return `false`', () => {
      expect(isValidDimensions('100x')).toBe(false);
    });

    test('`x100` should return `false`', () => {
      expect(isValidDimensions('x100')).toBe(false);
    });

    test('`100` should return `false`', () => {
      expect(isValidDimensions('100')).toBe(false);
    });

    test('`asdf` should return `false`', () => {
      expect(isValidDimensions('asdf')).toBe(false);
    });

    test('`asdfxasdf` should return `false`', () => {
      expect(isValidDimensions('asdfxasdf')).toBe(false);
    });

    test('`100x100x100` should return `false`', () => {
      expect(isValidDimensions('100x100x100')).toBe(false);
    });
  });

  describe('#isValidImageType', () => {
    test('`map` should return `true`', () => {
      expect(isValidImageType('map')).toBe(true);
    });

    test('`asdf` should return `false`', () => {
      expect(isValidImageType('asdf')).toBe(false);
    });
  });

  describe('#getImageQuality', () => {
    test('`map` returns `75`', () => {
      expect(getImageQuality('map')).toBe(75);
    });

    test('`anything-else` returns `60`', () => {
      expect(getImageQuality('anything-else')).toBe(60);
    });
  });

  describe('#getDimensions', () => {
    test('`100x100` returns [100, 100]', () => {
      expect(getDimensions('100x100')).toEqual(expect.arrayContaining([100, 100]));
    });

    test('`invalid dimensions` returns empty array', () => {
      expect(getDimensions('invalid dimensions')).toEqual(expect.arrayContaining([]));
    });
  });
});
