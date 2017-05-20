import os from 'os';
import {expect} from 'chai';

import {
  detectEndianness,
  decodeBase64,
  formatSize,
  roundUpToPow2,
  toString,
} from '../../src/common/utils';

describe('common/utils', () => {
  it('detects endianness', () => {
    expect(detectEndianness()).to.be.equal(os.endianness());
  });

  it('decodes base64 using Node.js buffer', () => {
    expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.be.equal('buffer-result');
  });

  it('decodes base64 using window.atob', () => {
    try {
      global.window = {atob: () => 'atob-result'};
      expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.be.equal('atob-result');
    } finally {
      global.window = undefined;
    }
  });

  it('formats size', () => {
    expect(formatSize(0)).to.equal('0 B');
    expect(formatSize(2)).to.equal('2 B');
    expect(formatSize(4 * 1024)).to.equal('4 KB');
    expect(formatSize(8 * 1024 * 1024)).to.equal('8 MB');
    expect(formatSize(8.5 * 1024 * 1024)).to.equal('8.5 MB');
    expect(formatSize(8.1234 * 1024 * 1024)).to.equal('8.123 MB');
    expect(formatSize(-1)).to.equal('-1 B');
    expect(formatSize(-3 * 1024)).to.equal('-3 KB');
    expect(formatSize(-7 * 1024 * 1024)).to.equal('-7 MB');
    expect(formatSize('not a number')).to.be.undefined;
  });

  it('rounds up numbers to a power of 2', () => {
    expect(roundUpToPow2(0)).to.equal(1);
    expect(roundUpToPow2(1)).to.equal(1);
    expect(roundUpToPow2(513)).to.equal(1024);
    expect(roundUpToPow2(1024)).to.equal(1024);
  });

  it('converts value to string', () => {
    expect(toString(undefined)).to.be.equal('undefined');
    expect(toString(null)).to.be.equal('null');
    expect(toString(123)).to.be.equal('123');
    expect(toString('abc')).to.be.equal('"abc"');
    expect(toString('a'.repeat(100))).to.be.equal(`"${'a'.repeat(80)}..."`);
    expect(toString(() => {})).to.be.equal('Function');
    expect(toString(function foo() {})).to.be.equal('Function(foo)'); // eslint-disable-line prefer-arrow-callback
    expect(toString({})).to.be.equal('Object');
    expect(toString(Uint8Array.of(1, 2, 3))).to.be.equal('Uint8Array(3)');
    expect(toString(Symbol('bar'))).to.be.equal('Symbol(bar)');
  });
});
