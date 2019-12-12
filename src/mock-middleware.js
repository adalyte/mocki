import { match, pathToRegexp } from 'path-to-regexp';

const mockMiddleware = options => async (req, res, next) => {
  const { getConfiguration, logger } = options;

  const { configuration, parsedPath } = await getConfiguration(req);

  const endpoint = configuration.endpoints.find(endpointToMatch =>
    parsedPath.match(pathToRegexp(endpointToMatch.path))
  );

  if (!endpoint) return req.send(null);

  const validOperators = ['eq'];

  const requestData = match(endpoint.path, { decode: decodeURIComponent })(
    parsedPath
  );

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
        get(requestData, response.condition.comparand) ===
        response.condition.value
    );
  }
  if (!response) response = defaultResponse;
  if (response.delay && response.delay > 0) {
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

  return res.send(response.body);
};

export default mockMiddleware;
