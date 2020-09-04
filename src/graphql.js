const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const supertest = require('supertest');
const { buildClientSchema } = require('graphql');

const generateMocks = mocks => {
  const generatedMocks = {};
  Object.keys(mocks).forEach(mock => {
    generatedMocks[mock] = () => mocks[mock];
  });
  return generatedMocks;
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

  const request = supertest(app);

  const result = await request.post('/').send(req.body);

  return result.body;
};

module.exports = graphql;
