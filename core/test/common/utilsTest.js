/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import os from 'os';
import {expect} from 'chai';
import * as module from '../../src/common/utils';

describe('common/utils', () => {
  it('should detect endianness', () => {
    expect(module.detectEndianness()).to.be.equal(os.endianness());
  });

  it('should decode base64', () => {
    try {
      expect(global.window).to.be.undefined;
      expect(module.decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.be.equal('buffer-result');
      global.window = {atob() { return 'atob-result'; }};
      expect(module.decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.be.equal('atob-result');
    } finally {
      global.window = undefined;
    }
  });

  it('should format size', () => {
    expect(module.formatSize(0)).to.equal('0 B');
    expect(module.formatSize(2)).to.equal('2 B');
    expect(module.formatSize(4 * 1024)).to.equal('4 KB');
    expect(module.formatSize(8 * 1024 * 1024)).to.equal('8 MB');
    expect(module.formatSize(8.5 * 1024 * 1024)).to.equal('8.5 MB');
    expect(module.formatSize(8.1234 * 1024 * 1024)).to.equal('8.123 MB');
    expect(module.formatSize(-1)).to.equal('-1 B');
    expect(module.formatSize(-3 * 1024)).to.equal('-3 KB');
    expect(module.formatSize(-7 * 1024 * 1024)).to.equal('-7 MB');
    expect(module.formatSize('not a number')).to.be.undefined;
  });

  it('should round up to power of 2', () => {
    expect(module.roundUpToPow2(0)).to.equal(1);
    expect(module.roundUpToPow2(1)).to.equal(1);
    expect(module.roundUpToPow2(513)).to.equal(1024);
    expect(module.roundUpToPow2(1024)).to.equal(1024);
  });
});
