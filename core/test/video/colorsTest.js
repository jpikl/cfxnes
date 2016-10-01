import {expect} from 'chai';
import * as module from '../../src/video/colors';

describe('video/colors', () => {
  it('packs color', () => {
    expect(module.packColorLE(0x12, 0x34, 0x56, 0x78)).to.equal(0x78563412);
    expect(module.packColorBE(0x12, 0x34, 0x56, 0x78)).to.equal(0x12345678);
    expect(module.packColorLE(0x12, 0x34, 0x56)).to.equal(0xFF563412);
    expect(module.packColorBE(0x12, 0x34, 0x56)).to.equal(0x123456FF);
  });

  it('unpacks color', () => {
    expect(module.unpackColorLE(0x78563412)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(module.unpackColorBE(0x12345678)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });
});
