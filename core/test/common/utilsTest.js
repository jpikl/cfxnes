import os from 'os';
import {expect} from 'chai';

import {
  detectEndianness,
  decodeBase64,
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
});
