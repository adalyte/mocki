const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const supertest = require('supertest');
const { buildClientSchema } = require('graphql');

const generateMocks = obj => {
  const result = {};
  for (const property in obj) {
    result[property] = () =>
      typeof obj[property] === 'object' && !Array.isArray(obj[property])
        ? generateMocks(obj[property])
        : obj[property];
  }
  return result;
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
