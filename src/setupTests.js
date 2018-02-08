
// Manually set environment variables

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, {
  BUCKET,
  CLOUDFRONT_URL,
  ERROR_DOCUMENT
});


// Switch the logger to silent mode while testing

beforeAll(() => {
  const { logger } = require('./utils');

  logger.transports['console.info'].silent = true;
});
