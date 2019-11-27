import express from 'express';
import args from 'command-line-args';
import config from './config';

const app = express();
const options = args([
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultOption: '.mocki/config.yml'
  }
]);

const configuration = config.get(options.path);

configuration.endpoints.forEach(endpoint => {
  app[endpoint.method](endpoint.path, (req, res) => {
    const response =
      endpoint.responses[Math.floor(Math.random() * endpoint.responses.length)];
    res.status(response.statusCode || 200);
    if (response.headers) {
      response.headers.forEach(header => {
        res.set(header.name, header.value);
      });
    }
    res.send(response.body);
  });
});

app.listen(configuration.port, () =>
  console.log(`Mocki running on http://localhost:${configuration.port}`)
);
