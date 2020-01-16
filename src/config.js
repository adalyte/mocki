import fs from 'fs';
import logger from './logger';
import configParser from './config-parser';

const get = (path = './.mocki/config.yml') => {
  let config;
  let parsedConfig;
  try {
    config = fs.readFileSync(path, 'utf8');
  } catch (err) {
    logger.error(`Error: Failed to read file ${path}`);
    // process.exit(0); dont use in tests!!
  }
  try {
    parsedConfig = configParser.parse(config);
  } catch (err) {
    logger.error('Error: Failed to parse config - invalid YAML');
    // process.exit(0); dont use in tests!!
  }
  return parsedConfig;
};

export default {
  get
};
