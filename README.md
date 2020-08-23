# Mocki

[![npm version](https://badge.fury.io/js/mocki.svg)](https://badge.fury.io/js/mocki) [![Coverage Status](https://coveralls.io/repos/github/adalyte/mocki/badge.svg?branch=develop)](https://coveralls.io/github/adalyte/mocki?branch=develop)

Mocki is a tool that lets you create Mock REST and GraphQL APIs.

Support for

- Simulated failures
- Simulated delays
- Randomized reponses
- Conditional resposes
- Fake data generation

## Getting Started

1. Install Mocki `npm install -g mocki`
2. Create a config YAML-file using the structure in `.mocki/config.yml`

   Hello world example:

   ```
    name: mocki
    port: 3000
    endpoints:
      - path: /hello
        method: get
          responses:
            - statusCode: 200
              body:
                message: Hello from Mocki!
   ```

3. Start your mock by running `mocki run --path ./path/to/config.yml`
4. Test your mock by running
   `curl http://localhost:3000`
   ```
   { "message": "Hello World!" }
   ```

### Prerequisites

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions

- `npm > 6`
- `node > 12`

### Documentation

Documentation is available at [Mocki.io](https://mocki.io/docs)
