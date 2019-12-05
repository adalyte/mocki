#!/usr/bin/env node

import config from './config';
import logger from './logger';
import express from 'express';
import args from 'command-line-args';
import { get } from 'lodash';

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

const validOperators = ['eq'];

configuration.endpoints.forEach(endpoint => {
  app[endpoint.method](endpoint.path, (req, res) => {
    let response;
    const defaultResponse = endpoint.responses[0];
    if (!endpoint.behavior) response = defaultResponse;
    else if (endpoint.behavior === 'random') {
      response =
        endpoint.responses[
          Math.floor(Math.random() * endpoint.responses.length)
        ];
    } else if (endpoint.behavior === 'conditional') {
      endpoint.responses.forEach(response => {
        if (!validOperators.includes(response.condition.operator)) {
          logger.error(
            `Invalid operator '${
              response.condition.operator
            }'. Valid operators are: ${validOperators.join(', ')}.`
          );
        }
      });
      response = endpoint.responses.find(
        response =>
          get(req, response.condition.comparand) === response.condition.value
      );
    }
    if (!response) response = defaultResponse;

    res.status(response.statusCode || 200);
    if (response.headers) {
      response.headers.forEach(header => {
        res.set(header.name, header.value);
      });
    }
    res.send(response.body);
  });
});

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
