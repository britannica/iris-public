
const resizeImage = require('./resize-image');
const { CLOUDFRONT_URL, ERROR_DOCUMENT } = process.env;

// Tests

describe('resizeImage', () => {
  test('valid "size" keys return permanent redirect to new object', (done) => {
    const validKey = 's:500x500/56/176256-131-5CEFC130.jpg';

    resizeImage(validKey)
      .then((response) => {
        testValidKey(response, validKey);
        done();
      });
  });

  test('valid "image type" keys return permanent redirect to new object', (done) => {
    const validKey = 't:map/56/176256-131-5CEFC130.jpg';

    resizeImage(validKey)
      .then((response) => {
        testValidKey(response, validKey);
        done();
      });
  });

  test('valid combination of keys return permanent redirect to new object', (done) => {
    const validKey = 's:500x500,t:map/56/176256-131-5CEFC130.jpg';

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
    resizeImage('s:100x100/this-image-definitely-does-not-exist')
      .then((response) => {
        testDefaultResponse(response);
        done();
      });
  });

  test('invalid file types should return original key for GIF', (done) => {
    const size = 's:500x500';
    const originalKey = '13/181513-131-4F074388.gif';

    resizeImage(`${size}/${originalKey}`)
      .then((response) => {
        testOriginalKey(response, originalKey);
        done();
      });
  });

  test('if all parameters are invalid, return original key', (done) => {
    const params = 'a:123,b:456';
    const originalKey = '56/176256-131-5CEFC130.jpg';

    resizeImage(`${params}/${originalKey}`)
      .then((response) => {
        testOriginalKey(response, originalKey);
        done();
      });
  });


  // --- Crop

  test('a crop command without a size returns a permanent redirect to a new object', (done) => {
    const key = 'c:crop/56/176256-131-5CEFC130.jpg';

    resizeImage(key)
      .then((response) => {
        testValidKey(response, key);
        done();
      });
  });

  test('a crop command with a size returns a permanent redirect to a new object', (done) => {
    const key = 's:500x500,c:crop/56/176256-131-5CEFC130.jpg';

    resizeImage(key)
      .then((response) => {
        testValidKey(response, key);
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


/**
 * Run tests against a response that is returning the original image
 *
 * @param {object} response
 * @param {string} originalKey
 */

function testOriginalKey(response, originalKey) {
  expect(response.statusCode).toBe(302);
  expect(response.headers['Cache-Control']).toBe('max-age=604800');
  expect(response.headers['Location']).toBe(`${CLOUDFRONT_URL}/${originalKey}`);
}
