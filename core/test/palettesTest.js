/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import {createPalette} from '../src/palettes';

const ids = [
  'asq-real-a', 'asq-real-b',
  'bmf-fin-r2', 'bmf-fin-r3',
  'fceu-13', 'fceu-15', 'fceux',
  'nestopia-rgb', 'nestopia-yuv',
];

describe('createPalette', () => {
  it('should create palette for valid ID', () => {
    for (const id of ids) {
      const palette = createPalette(id);
      expect(palette).to.be.a('uint32array');
      expect(palette).to.have.lengthOf(64);
    }
  });

  it('should throw error for invalid ID', () => {
    expect(() => createPalette()).to.throw(Error);
    expect(() => createPalette('x')).to.throw(Error);
  });
});
