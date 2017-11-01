import {expect} from 'chai';
import {packColor, unpackColor} from '../../src/video/colors';
import {isPaletteName, createPalette, createPaletteVariant} from '../../src/video/palettes';

describe('video/palettes', () => {
  const names = [
    'asq-real-a',
    'asq-real-b',
    'bmf-fin-r2',
    'bmf-fin-r3',
    'fceu-13',
    'fceu-15',
    'fceux',
    'nestopia-rgb',
    'nestopia-yuv',
    'sony-cxa2025as',
    'unsaturated-v6',
  ];

  it('validates palette name', () => {
    expect(isPaletteName('x')).to.be.false;
    expect(isPaletteName('fceux')).to.be.true;
  });

  it('creates default palette when no name is specified', () => {
    const palette = createPalette();
    expect(palette).to.be.an('Uint32Array').with.lengthOf(64);
  });

  for (const name of names) {
    it(`creates ${name} palette`, () => {
      const palette = createPalette(name);
      expect(palette).to.be.an('Uint32Array').with.lengthOf(64);
    });
  }

  it('throws error when creating invalid palette', () => {
    expect(() => createPalette('x')).to.throw('Invalid palette: "x"');
  });

  it('creates palette variant', () => {
    const palette = new Uint32Array(64);
    palette[0] = packColor(96, 128, 196);
    palette[59] = packColor(96, 128, 196);

    const paletteVariant = createPaletteVariant(palette, 0.5, 0.7, 0.9);
    const color0 = unpackColor(paletteVariant[0]);
    const color59 = unpackColor(paletteVariant[59]);

    expect(color0).to.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
    expect(color59).to.deep.equal([0x30, 0x59, 0xB0, 0xFF]);
  });
});
