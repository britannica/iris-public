
const AWS = require('aws-sdk');
const deasync = require('deasync');

// Get environment variables from config

const { BUCKET, CLOUDFRONT_URL, ERROR_DOCUMENT } = require('../config/local.json').handler;


// Get environment variables from SSM

AWS.config.update({ region: 'us-east-1' });

const ssm = new AWS.SSM();
const getParameterSync = deasync(ssm.getParameter.bind(ssm));
const data = getParameterSync({ Name: '/iris/GOOGLE_API_KEY' });


// Set environment variables

Object.assign(process.env, {
  BUCKET,
  CLOUDFRONT_URL,
  ERROR_DOCUMENT,
  GOOGLE_API_KEY: data.Parameter.Value,
});


// Actions to perform before each test suite

beforeAll(() => {
  // Switch the logger to silent mode while testing

  const { logger } = require('./utils');

  logger.transports['console.info'].silent = true;
});
