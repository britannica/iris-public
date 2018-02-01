
const resizeImage = require('./src/resize-image');

/**
 * The resize function to be deployed to Lambda
 *
 * @param {Object}    event
 * @param {Object}    context
 * @param {Function}  callback
 */

module.exports.resizeImage = (event, context, callback) => {
  resizeImage(event.queryStringParameters.key)
    .then(response => callback(null, response));
};
