import {describe, it} from 'mocha';
import {expect} from 'chai';
import decodeBase64 from '../../src/common/decodeBase64';

describe('common/decodeBase64', () => {
  it('decodes Base64 using Node.js buffer', () => {
    expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.equal('buffer-result');
  });

  it('decodes Base64 using window.atob', () => {
    try {
      global.window = {atob: () => 'atob-result'};
      expect(decodeBase64('YnVmZmVyLXJlc3VsdA==')).to.equal('atob-result');
    } finally {
      global.window = undefined;
    }
  });
});
