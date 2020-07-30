const express = require('express');
const config = require('./config');
const mockMiddleware = require('./mock-middleware');
const logger = require('./logger');

const run = ({ path }) => {
  const app = express();
  const configuration = config.get(path);
  const port = configuration.port || 3000;

  const getConfiguration = (req) => {
    const segments = req.url.split('/');
    const parsedPath = `/${segments.slice(1, segments.length).join('/')}`;
    return { parsedPath, configuration };
  };

  app.use(express.json());
  app.use(mockMiddleware({ getConfiguration, logger }));

  app.listen(port, () => {
    logger.info('🚀 Thank you for using Mocki!\n');
    logger.info(
      '📘 Having trouble? Check out the official documentation at https://mocki.io/docs\n'
    );
    logger.info('Endpoints:\n', ' ');
    configuration.endpoints.forEach((endpoint) => {
      logger.white(`${endpoint.method.toUpperCase()} - ${endpoint.path}`, ' ');
    });
    logger.info(
      `\n${configuration.name} running on http://localhost:${port}`,
      ' '
    );
  });
};

module.exports = run;
