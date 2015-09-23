import chai from 'chai';
import * as colors from '../../../../src/lib/core/utils/colors';

var expect = chai.expect;

describe('Colors utils', () => {

  it('can pack color', () => {
    expect(colors.packColor(0x12, 0x34, 0x56, 0x78, 'LE')).to.equal(0x78563412);
    expect(colors.packColor(0x12, 0x34, 0x56, 0x78, 'BE')).to.equal(0x12345678);
    expect(colors.packColor(0x12, 0x34, 0x56, undefined, 'LE')).to.equal(0xFF563412);
    expect(colors.packColor(0x12, 0x34, 0x56, undefined, 'BE')).to.equal(0x123456FF);
  });

  it('can unpack color', () => {
    expect(colors.unpackColor(0x78563412, 'LE')).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(colors.unpackColor(0x12345678, 'BE')).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });

});
