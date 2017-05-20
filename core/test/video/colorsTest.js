import {expect} from 'chai';
import {packColorLE, packColorBE, unpackColorLE, unpackColorBE} from '../../src/video/colors';

describe('video/colors', () => {
  it('packs color', () => {
    expect(packColorLE(0x12, 0x34, 0x56, 0x78)).to.equal(0x78563412);
    expect(packColorBE(0x12, 0x34, 0x56, 0x78)).to.equal(0x12345678);
    expect(packColorLE(0x12, 0x34, 0x56)).to.equal(0xFF563412);
    expect(packColorBE(0x12, 0x34, 0x56)).to.equal(0x123456FF);
  });

  it('unpacks color', () => {
    expect(unpackColorLE(0x78563412)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(unpackColorBE(0x12345678)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });
});
