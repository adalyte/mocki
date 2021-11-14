const { pathToRegexp } = require('path-to-regexp');
const { get } = require('lodash');
const graphql = require('./graphql');

const mockMiddleware = options => async (req, res, next) => {
  const { getConfiguration, logger } = options;

  const { configuration, parsedPath } = await getConfiguration(req);

  if (!configuration) {
    return res.send({ message: 'No API configuration found' });
  }

  const endpoint = configuration.endpoints.find(endpointToMatch =>
    parsedPath.match(pathToRegexp(endpointToMatch.path))
  );

  if (!endpoint) {
    return res.send({ message: 'Path not found' });
  }

  if (endpoint.graphql) {
    const graphqlResponse = await graphql(endpoint, req);
    return res.send(graphqlResponse);
  }

  const validOperators = ['eq'];

  let response;
  const defaultResponse = endpoint.responses[0];
  if (!endpoint.behavior) response = defaultResponse;
  if (endpoint.behavior === 'random') {
    response =
      endpoint.responses[Math.floor(Math.random() * endpoint.responses.length)];
  }
  if (endpoint.behavior === 'conditional') {
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

  // TODO: Think hard about the API here - on what level should things be? Maybe have the "single" stuff on the body instead
  if (response.single) {
    console.log('got a single');
    const sourceEndpoint = configuration.endpoints.find(
      endpointToMatch => endpointToMatch.id === response.single.source
    );
    console.log(`found source endpoint w id ${sourceEndpoint.id}`);
    console.log(
      `looking for body with id ${req.params[response.single.property]}`
    );
    console.log(req.params);
    // TODO: params are empty, something wrong with parsedPath?
    // TODO: Use first element really?
    response.body = sourceEndpoint.responses[0].body.find(
      sourceBody =>
        sourceBody[response.single.property] ===
        req.params[response.single.property]
    );
    console.log(`body is ${response.body}`);
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

module.exports = mockMiddleware;
