import { pathToRegexp } from 'path-to-regexp';
import { get } from 'lodash';

const mockMiddleware = options => async (req, res, next) => {
  const { getConfiguration, logger } = options;

  const { configuration, parsedPath } = await getConfiguration(req);

  const endpoint = configuration.endpoints.find(endpointToMatch =>
    parsedPath.match(pathToRegexp(endpointToMatch.path))
  );

  if (!endpoint) return res.send({ message: 'Path not found' });

  const validOperators = ['eq'];

  let response;
  const defaultResponse = endpoint.responses[0];
  if (!endpoint.behavior) response = defaultResponse;
  else if (endpoint.behavior === 'random') {
    response =
      endpoint.responses[Math.floor(Math.random() * endpoint.responses.length)];
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
  if (response.delay && response.delay > 0) {
    // TODO: Use async sleep
    const start = new Date().getTime();
    for (let i = 0; i < 1e7; i += 1) {
      if (new Date().getTime() - start > response.delay) {
        break;
      }
    }
  }

  res.status(response.statusCode || 200);
  if (response.headers) {
    response.headers.forEach(header => {
      res.set(header.name, header.value);
    });
  }

  res.set('Access-Control-Allow-Origin', '*');

  return res.send(response.body);
};

export default mockMiddleware;
