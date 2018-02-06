
// Put logging on silent mode

const { logger } = require('./utils');

logger.transports['console.info'].silent = true;
