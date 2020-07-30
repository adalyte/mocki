const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const logger = require('../src/logger');

const { expect } = chai;
chai.use(sinonChai);

describe('logger unit tests', () => {
  let consoleSpy;
  beforeEach(() => {
    consoleSpy = sinon.spy(console, 'log');
  });
  afterEach(() => {
    consoleSpy.restore();
  });

  it('should log info', () => {
    logger.info('info');
    expect(consoleSpy).to.have.been.calledOnce;
  });

  it('should log white', () => {
    logger.white('white');
    expect(consoleSpy).to.have.been.calledOnce;
  });

  it('should log error', () => {
    logger.error('error');
    expect(consoleSpy).to.have.been.calledOnce;
  });
});
