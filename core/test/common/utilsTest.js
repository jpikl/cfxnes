import os from 'os';
import {expect} from 'chai';

import {
  detectEndianness,
  decodeBase64,
  formatSize,
  describe,
} from '../../src/common/utils';

describe('common/utils', () => {
  it('detects endianness', () => {
    expect(detectEndianness()).to.equal(os.endianness());
  });

  it('decodes base64 using Node.js buffer', () => {
    expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.equal('buffer-result');
  });

  it('decodes base64 using window.atob', () => {
    try {
      global.window = {atob: () => 'atob-result'};
      expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.equal('atob-result');
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

  it('describes value', () => {
    expect(describe(undefined)).to.equal('undefined');
    expect(describe(null)).to.equal('null');
    expect(describe(123)).to.equal('123');
    expect(describe('abc')).to.equal('"abc"');
    expect(describe('a'.repeat(100))).to.equal(`"${'a'.repeat(80)}..."`);
    expect(describe(() => {})).to.equal('Function');
    expect(describe(function foo() {})).to.equal('Function(foo)'); // eslint-disable-line prefer-arrow-callback
    expect(describe({})).to.equal('Object');
    expect(describe(Uint8Array.of(1, 2, 3))).to.equal('Uint8Array(3)');
    expect(describe(Symbol('bar'))).to.equal('Symbol(bar)');
  });
});
