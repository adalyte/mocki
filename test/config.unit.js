import fs from 'fs';
import sinon from 'sinon';
import { expect } from 'chai';
import configuration from '../src/config';
import configParser from '../src/config-parser';
import logger from '../src/logger';

const config = {
  name: 'test',
  port: 3000,
  endpoints: [
    {
      path: '/',
      responses: [
        {
          statusCode: 200,
          headers: [
            {
              name: 'content-type',
              value: 'application/json'
            }
          ],
          body: {
            message: 'Hello World!'
          }
        }
      ]
    }
  ]
};

describe('config unit tests', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should load valid config', () => {
    sandbox.stub(fs, 'readFileSync').returns({});
    sandbox.stub(configParser, 'parse').returns(config);

    const result = configuration.get();
    expect(result).to.deep.equal(config);
  });

  it('should log failure to read file', () => {
    sandbox.stub(fs, 'readFileSync').throws();
    const loggerSpy = sandbox.spy(logger, 'error');

    configuration.get();
    expect(loggerSpy.getCall(0).args[0]).to.match(/Failed to read file/);
  });

  it('should log failure to parse config', () => {
    sandbox.stub(fs, 'readFileSync').returns({});
    sandbox.stub(configParser, 'parse').throws();
    const loggerSpy = sandbox.spy(logger, 'error');

    configuration.get();
    expect(loggerSpy.getCall(0).args[0]).to.match(/Failed to parse config/);
  });
});
