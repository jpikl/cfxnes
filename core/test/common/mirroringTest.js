/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Mirroring from '../../src/common/Mirroring';

describe('common/Mirroring', () => {
  const mirrorings = [
    Mirroring.SINGLE_SCREEN_0,
    Mirroring.SINGLE_SCREEN_1,
    Mirroring.SINGLE_SCREEN_2,
    Mirroring.SINGLE_SCREEN_3,
    Mirroring.VERTICAL,
    Mirroring.HORIZONTAL,
    Mirroring.FOUR_SCREEN,
  ];

  it('should have string values', () => {
    for (const mirroring of mirrorings) {
      expect(mirroring).to.be.a('string');
    }
  });

  it('should have areas', () => {
    for (const mirroring of mirrorings) {
      const areas = Mirroring.getAreas(mirroring);
      expect(areas).to.be.an('array');
      expect(areas).to.have.lengthOf(4);
    }
    expect(() => Mirroring.getAreas('x')).to.throw(Error);
  });

  it('should have 4 single screen variants', () => {
    for (let i = 0; i < 4; i++) {
      expect(Mirroring.getSingleScreen(i)).to.be.equal(mirrorings[i]);
    }
  });
});
