import chai from 'chai';
import os from 'os';
import { Logger, LogLevel, LogWriter } from '../../src/utils/logger';

var expect = chai.expect;

describe('Logger', () => {

  var logger;
  var writer;

  beforeEach(() => {
    logger = new Logger(LogLevel.ALL);
    writer = LogWriter.toBuffer();
  });

  it('should be able to attach writer', () => {
    logger.info('foo');
    expect(writer.buffer).to.be.empty;
    logger.attach(writer);
    logger.info('foo');
    expect(writer.buffer).to.deep.equal(['foo']);
  });

  it('should be able to attach multiple writers', () => {
    var secondWriter = LogWriter.toBuffer();
    logger.attach(writer);
    logger.attach(secondWriter);
    logger.info('foo');
    expect(writer.buffer).to.deep.equal(['foo']);
    expect(secondWriter.buffer).to.deep.equal(['foo']);
  });

  it('should be able to detach writer', () => {
    logger.attach(writer);
    logger.info('foo');
    expect(writer.buffer).to.deep.equal(['foo']);
    logger.detach(writer);
    logger.info('foo');
    expect(writer.buffer).to.deep.equal(['foo']);
  });

  it('should attach the same writer only once', () => {
    logger.attach(writer);
    logger.attach(writer);
    logger.info('foo');
    expect(writer.buffer).to.deep.equal(['foo']);
  });

  it('can be set to OFF level', () => {
    checkLevel(LogLevel.OFF, []);
  });

  it('can be set to ERROR level', () => {
    checkLevel(LogLevel.ERROR, ['error']);
  });

  it('can be set to WARN level', () => {
    checkLevel(LogLevel.WARN, ['error', 'warn']);
  });

  it('can be set to INFO level', () => {
    checkLevel(LogLevel.INFO, ['error', 'warn', 'info']);
  });

  it('can be set to ALL level', () => {
    checkLevel(LogLevel.ALL, ['error', 'warn', 'info']);
  });

  function checkLevel(level, output) {
    logger.setLevel(level);
    logger.attach(writer);
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    expect(writer.buffer).to.deep.equal(output);
  }

});
