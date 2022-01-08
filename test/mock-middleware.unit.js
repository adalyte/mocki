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

  it('should use collection reference as response body', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/users',
          configuration: {
            references: [
              {
                type: 'collection',
                id: 'users',
                data: [{ id: 'a', name: 'Alpha' }]
              }
            ],
            endpoints: [
              {
                path: '/users',
                method: 'get',
                responses: [
                  {
                    body: { $ref: { type: 'collection', id: 'users' } },
                    headers: []
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
      .get('/users')
      .expect(200)
      .then(res => {
        expect(res.body).to.include({ id: 'a', name: 'Alpha' });
      });
  });

  it('should use collection find reference as response body', async () => {
    app.use(
      mockMiddleware({
        getConfiguration: async () => ({
          parsedPath: '/users/a',
          configuration: {
            references: [
              {
                type: 'collection',
                id: 'users',
                data: [{ id: 'a', name: 'Alpha' }]
              }
            ],
            endpoints: [
              {
                path: '/users/:id',
                method: 'get',
                responses: [
                  {
                    body: { $ref: { type: 'collection', id: 'users', find: 'id' } },
                    headers: []
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
      .get('/users/a')
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('id').that.equals('a');
        expect(res.body).to.have.property('name').that.equals('Alpha');
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
    return request.get('/').then(res => expect(res.body).to.have.property('message', 'Path not found'));
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
    return request.get('/').then(res => expect(res.body).to.have.property('message', 'No API configuration found'));
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
    await request
      .post('/')
      .set('content-type', 'application/json')
      .send({
        query: `{
            getUser(id: "test") { id name email todos { id description done } },
            getUsers { id name email todos { id description done } },
            getTodos { id description done }
          }`
      })
      .then(res => {
        expect(res.body).to.have.nested.property('data.getUser');
        expect(res.body.data.getUser).to.have.all.keys('id', 'name', 'email', 'todos');
        expect(res.body.data.getUser.todos).to.be.an('array');
        expect(res.body).to.have.nested.property('data.getUsers');
        expect(res.body.data.getUsers).to.be.an('array');
        expect(res.body).to.have.nested.property('data.getTodos');
        expect(res.body.data.getTodos).to.be.an('array');
      });
    await request
      .post('/')
      .set('content-type', 'application/json')
      .send({
        query: `mutation {
            updateTodo(input: {id: "abc", done: true}) { id description done }
          }`
      })
      .then(res => {
        expect(res.body.data.updateTodo).to.be.an('object').that.has.all.keys(['id', 'description', 'done']);
      });
  });
  it('should handle graphql with custom mocks', async () => {
    const todo = {
      id: '8db57b8f-be09-4e07-a1f6-4fb77d9b16e7',
      description: 'Mow the lawn',
      done: true
    };
    const userTodos = [
      {
        id: 'be1081eb-e51e-4e1e-b0b7-7a231bf07358',
        description: 'Wash the dishes',
        done: false
      },
      {
        id: '2670dfd5-39bf-42fb-9715-bf5fe163fc07',
        description: 'Finish side project',
        done: true
      },
      {
        id: '82d977eb-5a91-426f-83e7-fb877af45488',
        description: 'Schedule appointment',
        done: true
      }
    ];
    const allTodos = [
      {
        id: 'df19d1c6-70b1-4c23-9d04-9e6d31b35cf7',
        description: 'Go to the dentist',
        done: false
      },
      {
        id: '87a2891b-9876-499d-984c-f14c3cb6d5a1',
        description: 'Mow the lawn',
        done: true
      },
      {
        id: '82d977eb-5a91-426f-83e7-fb877af45488',
        description: 'Fix the leaking sink',
        done: true
      },
      {
        id: '7450af2e-7d00-451f-8310-8f8e82c66259',
        description: 'Water the plants',
        done: false
      },
      {
        id: 'cc6b66a5-2b89-4b21-bde4-5a80f2e02647',
        description: 'Call Karen regarding her recent complaints',
        done: false
      },
      {
        id: 'ebc03482-2620-4d25-8c04-d9486a707bb0',
        description: 'Buy groceries',
        done: true
      }
    ];
    const user = {
      id: '297db395-0873-4047-a289-304ff35203c3',
      name: 'John Doe',
      email: 'john@acme.com',
      todos: userTodos
    };
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
                      User: user,
                      Todo: todo,
                      Query: {
                        getUsers: [user],
                        getTodos: allTodos
                      },
                      Mutation: {
                        updateTodo: todo
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
        query: `{
          getUser(id: "test") { id name email todos { id description done } },
          getUsers { id name email todos { id description done } },
          getTodos { id description done }
        }`
      })
      .then(res => {
        expect(res.body).to.have.nested.property('data.getUser');
        expect(res.body.data.getUser).to.have.all.keys('id', 'name', 'email', 'todos');
        expect(res.body.data.getUser.todos).to.be.an('array').that.deep.equals(userTodos);
        expect(res.body).to.have.nested.property('data.getUsers');
        expect(res.body.data.getUsers).to.be.an('array');
        expect(res.body.data.getUsers[0]).to.deep.equal(user);
        expect(res.body.data.getTodos).to.deep.equal(allTodos);
      });
  });
});
