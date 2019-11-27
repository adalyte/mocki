import fs from 'fs';
import yaml from 'yaml';

const get = (path = './sample-config.yml') => {
  let config;
  let parsedConfig;
  try {
    config = fs.readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read file ${path}`);
  }
  try {
    parsedConfig = yaml.parse(config);
  } catch (err) {
    throw new Error('Failed to parse config');
  }
  return parsedConfig;
};

export default {
  get
};
