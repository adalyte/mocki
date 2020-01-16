import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import logger from '../src/logger';

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
