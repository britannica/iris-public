
const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;

Object.assign(process.env, {
  BUCKET,
  CLOUDFRONT_URL,
  ERROR_DOCUMENT
});

// Put logging on silent mode

const { logger } = require('./utils');

logger.transports['console.info'].silent = true;
