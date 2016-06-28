/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import {packColor, unpackColor} from '../../src/video/colors';
import * as module from '../../src/video/palettes';

describe('video/palettes', () => {
  it('should create default palette when no ID is specified', () => {
    const palette = module.createPalette();
    expect(palette).to.be.an('uint32array');
    expect(palette).to.have.lengthOf(64);
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
    expect(() => module.createPalette('x')).to.throw(Error);
  });

  it('should create palette variant', () => {
    const palette = new Uint32Array(64);
    palette[0] = packColor(96, 128, 196);
    palette[59] = packColor(96, 128, 196);

    const paletteVariant = module.createPaletteVariant(palette, 0.5, 0.7, 0.9);
    const color0 = unpackColor(paletteVariant[0]);
    const color59 = unpackColor(paletteVariant[59]);

    expect(color0).to.be.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
    expect(color59).to.be.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
  });
});
