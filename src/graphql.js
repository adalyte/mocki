const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const supertest = require('supertest');
const { buildClientSchema } = require('graphql');

const graphql = async (endpoint, req) => {
  const schema = buildClientSchema(endpoint.graphql.schema);

  const server = new ApolloServer({
    schema,
    path: '/',
    mocks: true
  });

  const app = express();
  app.use(bodyParser.json());
  server.applyMiddleware({ app, path: '/' });

  const request = supertest(app);

  const result = await request.post('/').send(req.body);

  return result.body;
};

module.exports = graphql;
