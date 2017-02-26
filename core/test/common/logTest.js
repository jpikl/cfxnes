/* eslint-disable no-console */

import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import log from '../../src/common/log';

chai.use(sinonChai);

describe('common/log', () => {
  beforeEach(() => {
    sinon.stub(console, 'error');
    sinon.stub(console, 'warn');
    sinon.stub(console, 'info');
    log.setLevel('info');
  });

  afterEach(() => {
    console.error.restore();
    console.warn.restore();
    console.info.restore();
  });

  after(() => {
    log.setLevel('warn');
  });

  it('throws error when setting invalid log level', () => {
    expect(() => log.setLevel()).to.throw('Invalid log level: undefined');
    expect(() => log.setLevel('x')).to.throw('Invalid log level: "x"');
  });

  it('changes log level', () => {
    expect(log.getLevel()).not.to.be.equal('off');
    log.setLevel('off');
    expect(log.getLevel()).to.be.equal('off');
  });

  it('forwards error calls', () => {
    log.error('message1', 'message2');
    expect(console.error).to.have.been.calledOnce;
    expect(console.error).to.have.been.calledWith('message1', 'message2');
  });

  it('forwards warn calls', () => {
    log.warn('message1', 'message2');
    expect(console.warn).to.have.been.calledOnce;
    expect(console.warn).to.have.been.calledWith('message1', 'message2');
  });

  it('forwards info calls', () => {
    log.info('message1', 'message2');
    expect(console.info).to.have.been.calledOnce;
    expect(console.info).to.have.been.calledWith('message1', 'message2');
  });

  it('logs nothing for "off" level', () => {
    testLevel('off', 0, 0, 0);
  });

  it('logs errors for "error" level', () => {
    testLevel('error', 1, 0, 0);
  });

  it('logs errors, warnings for "warn" level', () => {
    testLevel('warn', 1, 1, 0);
  });

  it('logs errors, warnings, infos for "info" level', () => {
    testLevel('info', 1, 1, 1);
  });

  function testLevel(level, errors, warnings, infos) {
    log.setLevel(level);
    log.error('message');
    log.warn('message');
    log.info('message');
    expect(console.error).to.have.callCount(errors);
    expect(console.warn).to.have.callCount(warnings);
    expect(console.info).to.have.callCount(infos);
  }
});
