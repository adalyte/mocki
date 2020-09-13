const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const supertest = require('supertest');
const { buildClientSchema } = require('graphql');
const stringifyObject = require('./stringify-object');

const generateMocks = obj => {
  const objStr = stringifyObject(obj);
  // TODO: Do not replace characters that are inside strings
  const funcStr = objStr
    .replace(/:/g, ': () => ')
    .replace(/{/g, '({')
    .replace(/}/g, '})');
  // TODO: Make sure input object does not contain any functions, as to not allow remote code execution
  return eval(funcStr);
};

const graphql = async (endpoint, req) => {
  const schema = buildClientSchema(endpoint.graphql.schema);

  const server = new ApolloServer({
    schema,
    path: '/',
    mocks: endpoint.graphql.mocks ? generateMocks(endpoint.graphql.mocks) : true
  });

  const app = express();
  app.use(bodyParser.json());
  server.applyMiddleware({ app, path: '/' });

  const result = await supertest(app).post('/').send(req.body);

  return result.body;
};

module.exports = graphql;
