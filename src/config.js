const fs = require('fs');
const logger = require('./logger');
const configParser = require('./config-parser');

const get = (path = './.mocki/config.yml') => {
  let config;
  let parsedConfig;
  try {
    config = fs.readFileSync(path, 'utf8');
  } catch (err) {
    logger.error(`Error: Failed to read file ${path}`);
    // process.exit(0);
  }
  try {
    parsedConfig = configParser.parse(config);
  } catch (err) {
    logger.error('Error: Failed to parse config - invalid YAML');
    // process.exit(0);
  }
  return parsedConfig;
};

module.exports = { get };
