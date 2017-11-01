import fs from 'fs';
import {expect} from 'chai';
import sha1 from '../../src/cartridge/sha1';

describe('data/sha1', () => {
  it('computes SHA-1', () => {
    const data = new Uint8Array(fs.readFileSync('./test/roms/nestest/nestest.nes'));
    expect(sha1(data)).to.equal('5b608f023b41399c34dfc6c847d8af084e0f7aeb');
  });
});
