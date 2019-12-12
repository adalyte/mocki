#!/usr/bin/env node

import args from 'command-line-args';
import config from './config';
import logger from './logger';
import express from 'express';
import mockMiddleware from './mock-middleware';

const app = express();
const options = args([
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultOption: '.mocki/config.yml'
  }
]);

const configuration = config.get(options.path);
const port = configuration.port || 3000;

const getConfiguration = req => {
  const segments = req.url.split('/');
  const parsedPath = `/${segments.slice(1, segments.length).join('/')}`;
  return { parsedPath, configuration };
};

app.use(mockMiddleware({ getConfiguration, logger }));

app.listen(port, () => {
  logger.info('🚀 Thank you for using Mocki!\n');
  logger.info(
    '📘 Having trouble? Check out the official documentation at https://mocki.io/docs\n'
  );
  logger.info('Endpoints:\n', ' ');
  configuration.endpoints.forEach(endpoint => {
    logger.white(`${endpoint.method.toUpperCase()} - ${endpoint.path}`, ' ');
  });
  logger.info(
    `\n${configuration.name} running on http://localhost:${port}`,
    ' '
  );
});
