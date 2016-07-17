/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Region from '../../src/common/Region';

describe('common/Region', () => {
  const regions = [Region.NTSC, Region.PAL];

  it('should have string values', () => {
    for (const region of regions) {
      expect(region).to.be.a('string');
    }
  });

  it('should have parameters', () => {
    for (const region of regions) {
      const params = Region.getParams(region);
      expect(params).to.be.an('object');
      expect(params).to.include.keys([
        'framesPerSecond', 'cpuFrequency', 'ppuClipTopBottom', 'frameCounterMax4',
        'frameCounterMax5', 'noiseChannelTimerPeriods', 'dmcChannelTimerPeriods',
      ]);
    }
    expect(() => Region.getParams('x')).to.throw(Error);
  });
});