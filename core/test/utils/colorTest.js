/* eslint-env mocha */

import chai from 'chai';
import * as colors from '../../src/utils/color';

const expect = chai.expect;

describe('Colors utils', () => {
  it('can pack color', () => {
    expect(colors.packColorLE(0x12, 0x34, 0x56, 0x78)).to.equal(0x78563412);
    expect(colors.packColorBE(0x12, 0x34, 0x56, 0x78)).to.equal(0x12345678);
    expect(colors.packColorLE(0x12, 0x34, 0x56)).to.equal(0xFF563412);
    expect(colors.packColorBE(0x12, 0x34, 0x56)).to.equal(0x123456FF);
  });

  it('can unpack color', () => {
    expect(colors.unpackColorLE(0x78563412)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(colors.unpackColorBE(0x12345678)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });
});
