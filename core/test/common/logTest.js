/* eslint-disable no-console */

import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {setLevel, getLevel, info, warn, error} from '../../src/common/log';

use(sinonChai);

describe('common/log', () => {
  beforeEach(() => {
    sinon.stub(console, 'error');
    sinon.stub(console, 'warn');
    sinon.stub(console, 'info');
    setLevel('info');
  });

  afterEach(() => {
    console.error.restore();
    console.warn.restore();
    console.info.restore();
  });

  after(() => {
    setLevel('warn');
  });

  it('throws error when setting invalid log level', () => {
    expect(() => setLevel()).to.throw('Invalid log level: undefined');
    expect(() => setLevel('x')).to.throw('Invalid log level: "x"');
  });

  it('changes log level', () => {
    expect(getLevel()).not.to.be.equal('off');
    setLevel('off');
    expect(getLevel()).to.be.equal('off');
  });

  it('forwards error calls', () => {
    error('message1', 'message2');
    expect(console.error).to.have.been.calledOnce;
    expect(console.error).to.have.been.calledWith('message1', 'message2');
  });

  it('forwards warn calls', () => {
    warn('message1', 'message2');
    expect(console.warn).to.have.been.calledOnce;
    expect(console.warn).to.have.been.calledWith('message1', 'message2');
  });

  it('forwards info calls', () => {
    info('message1', 'message2');
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
    setLevel(level);
    error('message');
    warn('message');
    info('message');
    expect(console.error).to.have.callCount(errors);
    expect(console.warn).to.have.callCount(warnings);
    expect(console.info).to.have.callCount(infos);
  }
});
