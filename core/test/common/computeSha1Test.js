import fs from 'fs';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import computeSha1 from '../../src/common/computeSha1';

describe('common/computeSha1', () => {
  it('computes SHA-1', () => {
    const data = new Uint8Array(fs.readFileSync('./test/roms/nestest/nestest.nes'));
    expect(computeSha1(data)).to.equal('5b608f023b41399c34dfc6c847d8af084e0f7aeb');
  });
});
