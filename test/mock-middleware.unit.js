const supertest = require('supertest');
const bodyParser = require('body-parser');
const sinon = require('sinon');
const express = require('express');
const { expect } = require('chai');
const Promise = require('bluebird');
const mockMiddleware = require('../src/mock-middleware');
const logger = require('../src/logger');
const graphqlSchema = require('./graphql-schema.json');

let app;

describe('mock middleware unit tests', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    app = express();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should default to 200 ok if statusCode is not defined', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                responses: [{ body: { message: 'hello' }, headers: [] }]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    return request
      .get('/test')
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('hello');
      });
  });

  it('should parse headers', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                responses: [
                  {
                    body: { message: 'hello' },
                    headers: [{ name: 'foo', value: 'bar' }]
                  }
                ]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    return request
      .get('/')
      .expect('foo', 'bar')
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('hello');
      });
  });

  it('should add delay', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                responses: [
                  {
                    body: {},
                    delay: 300
                  }
                ]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    const before = Date.now();
    return request
      .get('/')
      .expect(200)
      .then(() => {
        const delay = Date.now() - before;
        expect(delay > 300 && delay < 320); // Accept 20 ms diff for setup etc
      });
  });

  it('should use randomized response', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                behavior: 'random',
                responses: [
                  {
                    body: { value: 'a' }
                  },
                  {
                    body: { value: 'b' }
                  }
                ]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    const responses = [];
    const promises = [1, 2, 3, 4, 5, 6, 7, 8];
    await Promise.each(promises, () =>
      request
        .get('/')
        .expect(200)
        .then(res => responses.push(res.body.value))
    );
    expect(responses).to.include('a');
    expect(responses).to.include('b');
  });

  it('should use conditional behavior', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                behavior: 'conditional',
                responses: [
                  {
                    condition: {
                      operator: 'eq',
                      comparand: 'headers.foo',
                      value: 'bar'
                    },
                    body: {
                      value: 'a'
                    }
                  },
                  {
                    condition: {
                      operator: 'eq',
                      comparand: 'headers.foo',
                      value: 'baz'
                    },
                    body: {
                      value: 'b'
                    }
                  }
                ]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    await request
      .get('/')
      .set('foo', 'bar')
      .expect(200)
      .then(res => expect(res.body.value).equals('a'));
    await request
      .get('/')
      .set('foo', 'baz')
      .expect(200)
      .then(res => expect(res.body.value).equals('b'));
  });

  it('should throw when using invalid operator', async () => {
    const loggerSpy = sandbox.spy(logger, 'error');
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: [
              {
                path: '/',
                method: 'get',
                behavior: 'conditional',
                responses: [
                  {
                    condition: {
                      operator: 'invalid',
                      comparand: 'headers.foo',
                      value: 'bar'
                    },
                    body: {
                      value: 'a'
                    }
                  }
                ]
              }
            ]
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    await request.get('/');
    expect(loggerSpy.getCall(0).args[0]).to.match(/Invalid operator/);
  });

  it('should return empty response', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/',
          configuration: {
            endpoints: []
          }
        }),
        logger
      })
    );
    const request = supertest(app);
    return request
      .get('/')
      .then(res =>
        expect(res.body).to.have.property('message', 'Path not found')
      );
  });

  it('should return configuration not found response', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          configuration: null,
          parsedPath: '/'
        }),
        logger
      })
    );
    const request = supertest(app);
    return request
      .get('/')
      .then(res =>
        expect(res.body).to.have.property(
          'message',
          'No API configuration found'
        )
      );
  });

  it('should handle graphql', async () => {
    app.use(bodyParser.json());
    app.use(
      mockMiddleware({
        getConfiguration: async () => {
          return {
            parsedPath: '/',
            configuration: {
              endpoints: [
                {
                  path: '/',
                  method: 'post',
                  graphql: {
                    schema: graphqlSchema
                  }
                }
              ]
            }
          };
        },
        logger
      })
    );
    const request = supertest(app);
    return request
      .post('/')
      .set('content-type', 'application/json')
      .send({
        query: `{ exampleQuery { data } } `
      })
      .then(res => {
        expect(res.body).to.have.nested.property('data.exampleQuery.data');
        expect(res.body.data.exampleQuery.data).to.be.an('array');
      });
  });
  it('should handle graphql with custom mocks', async () => {
    app.use(bodyParser.json());
    app.use(
      mockMiddleware({
        getConfiguration: async () => {
          return {
            parsedPath: '/',
            configuration: {
              endpoints: [
                {
                  path: '/',
                  method: 'post',
                  graphql: {
                    schema: graphqlSchema,
                    mocks: {
                      ExampleResponse: {
                        data: ['apple', 'banana', 'pear', 'mango']
                      }
                    }
                  }
                }
              ]
            }
          };
        },
        logger
      })
    );
    const request = supertest(app);
    return request
      .post('/')
      .set('content-type', 'application/json')
      .send({
        query: `{ exampleQuery { data } } `
      })
      .then(res => {
        expect(res.body).to.have.nested.property('data.exampleQuery.data');
        expect(res.body.data.exampleQuery.data).to.deep.equal([
          'apple',
          'banana',
          'pear',
          'mango'
        ]);
      });
  });
});
