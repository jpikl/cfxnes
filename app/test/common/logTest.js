import {expect} from 'chai';
import {Log} from '../../src/common/log';
import {OFF, ERROR, WARN, INFO} from '../../src/common/logLevels';

describe('common/log', () => {
  let log, infos, warns, errors;

  beforeEach(() => {
    infos = [];
    warns = [];
    errors = [];
    log = new Log({
      info(...args) { infos.push(args); },
      warn(...args) { warns.push(args); },
      error(...args) { errors.push(args); },
    });
  });

  it('has "off" log level by default', () => {
    expect(log.getLevel()).to.equal(OFF);
  });

  it('changes log level', () => {
    log.setLevel(INFO);
    expect(log.getLevel()).to.equal(INFO);
  });

  it('logs nothing for "off" level', () => {
    log.setLevel(OFF);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([]);
    expect(warns).to.deep.equal([]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors for "error" level', () => {
    log.setLevel(ERROR);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors and warnings for "warn" level', () => {
    log.setLevel(WARN);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([['fooo', 'baar']]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors, warnings and infos for "info" level', () => {
    log.setLevel(INFO);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([['fooo', 'baar']]);
    expect(infos).to.deep.equal([['foooo', 'baaar']]);
  });
});
