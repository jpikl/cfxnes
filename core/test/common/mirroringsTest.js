import {expect} from 'chai';

import {
  SCREEN_0, SCREEN_1, SCREEN_2, SCREEN_3,
  VERTICAL, HORIZONTAL, FOUR_SCREEN,
  getSingle, getAreas,
} from '../../src/common/mirrorings';

describe('common/mirrorings', () => {
  const mirrorings = [
    SCREEN_0, SCREEN_1, SCREEN_2, SCREEN_3,
    VERTICAL, HORIZONTAL, FOUR_SCREEN,
  ];

  it('has string values', () => {
    for (const mirroring of mirrorings) {
      expect(mirroring).to.be.a('string');
    }
  });

  it('has 4 single screen variants', () => {
    for (let i = 0; i < 4; i++) {
      expect(getSingle(i)).to.equal(mirrorings[i]);
    }
  });

  it('provides area for each value', () => {
    for (const mirroring of mirrorings) {
      const areas = getAreas(mirroring);
      expect(areas).to.be.an('array').with.lengthOf(4);
    }
  });

  it('throws error when getting area for invalid value', () => {
    expect(() => getAreas()).to.throw('Invalid mirroring: undefined');
    expect(() => getAreas('x')).to.throw('Invalid mirroring: "x"');
  });
});
