#!/usr/bin/env node

const args = require('command-line-args');
const logger = require('./logger');
const run = require('./run');

const options = args([
  {
    name: 'positionals',
    multiple: true,
    defaultOption: true
  },
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultOption: '.mocki/config.yml'
  }
]);

const validArgs =
  options.positionals &&
  options.positionals.length === 1 &&
  options.positionals.every(p => p);

if (!validArgs) {
  logger.error('Invalid arguments provided');
  process.exit(0);
}

switch (options.positionals[0]) {
  case 'run':
    run(options);
    break;
  default:
    logger.error(
      `Invalid command "${options.positionals[0]}". Valid commands are: run`
    );
    process.exit(0);
}
