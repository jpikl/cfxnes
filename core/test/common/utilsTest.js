/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import os from 'os';
import {expect} from 'chai';
import {detectEndianness, decodeBase64, formatSize, roundUpToPow2, assert} from '../../src/common/utils';

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

  it('does nothing when asserting positive condition', () => {
    assert(true);
  });

  it('throws error when asserting negative condition', () => {
    expect(() => assert(false)).to.throw(Error);
    expect(() => assert(false, 'msg')).to.throw('msg');
  });
});
