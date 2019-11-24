import {expect} from 'chai';
import Log from '../../src/common/Log';
import LogLevel from '../../src/common/LogLevel';

describe('common/Log', () => {
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
    expect(log.getLevel()).to.equal(LogLevel.OFF);
  });

  it('changes log level', () => {
    log.setLevel(LogLevel.INFO);
    expect(log.getLevel()).to.equal(LogLevel.INFO);
  });

  it('throws error when setting invalid log level', () => {
    expect(() => log.setLevel()).to.throw('Invalid log level: undefined');
    expect(() => log.setLevel('x')).to.throw('Invalid log level: "x"');
  });

  it('logs nothing for "off" level', () => {
    log.setLevel(LogLevel.OFF);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([]);
    expect(warns).to.deep.equal([]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors for "error" level', () => {
    log.setLevel(LogLevel.ERROR);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors and warnings for "warn" level', () => {
    log.setLevel(LogLevel.WARN);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([['fooo']]);
    expect(infos).to.deep.equal([]);
  });

  it('logs errors, warnings and infos for "info" level', () => {
    log.setLevel(LogLevel.INFO);
    log.error('foo', 'bar');
    log.warn('fooo', 'baar');
    log.info('foooo', 'baaar');
    expect(errors).to.deep.equal([['foo', 'bar']]);
    expect(warns).to.deep.equal([['fooo']]);
    expect(infos).to.deep.equal([['foooo']]);
  });
});
