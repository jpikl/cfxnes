/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import * as module from '../src/palettes';

describe('palettes', () => {
  it('should pack color', () => {
    expect(module.packColorLE(0x12, 0x34, 0x56, 0x78)).to.equal(0x78563412);
    expect(module.packColorBE(0x12, 0x34, 0x56, 0x78)).to.equal(0x12345678);
    expect(module.packColorLE(0x12, 0x34, 0x56)).to.equal(0xFF563412);
    expect(module.packColorBE(0x12, 0x34, 0x56)).to.equal(0x123456FF);
  });

  it('should unpack color', () => {
    expect(module.unpackColorLE(0x78563412)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
    expect(module.unpackColorBE(0x12345678)).to.deep.equal([0x12, 0x34, 0x56, 0x78]);
  });

  it('should create palette for valid ID', () => {
    const ids = [
      'asq-real-a',
      'asq-real-b',
      'bmf-fin-r2',
      'bmf-fin-r3',
      'fceu-13',
      'fceu-15',
      'fceux',
      'nestopia-rgb',
      'nestopia-yuv',
    ];
    for (const id of ids) {
      const palette = module.createPalette(id);
      expect(palette).to.be.an('uint32array');
      expect(palette).to.have.lengthOf(64);
    }
  });

  it('should throw error for invalid ID', () => {
    expect(() => module.createPalette()).to.throw(Error);
    expect(() => module.createPalette('x')).to.throw(Error);
  });

  it('should create palette variant', () => {
    const palette = new Uint32Array(64);
    palette[0] = module.packColor(96, 128, 196);
    palette[59] = module.packColor(96, 128, 196);

    const paletteVariant = module.createPaletteVariant(palette, 0.5, 0.7, 0.9);
    const color0 = module.unpackColor(paletteVariant[0]);
    const color59 = module.unpackColor(paletteVariant[59]);

    expect(color0).to.be.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
    expect(color59).to.be.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
  });
});
