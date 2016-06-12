/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import * as Region from '../../src/enums/region';

const regions = [Region.NTSC, Region.PAL];

describe('Region', () => {
  it('should have string values', () => {
    for (const region of regions) {
      expect(region).to.be.a('string');
    }
  });

  it('should return parameters', () => {
    for (const region of regions) {
      const params = Region.getParams(region);
      expect(params).to.be.an('object');
      expect(params).to.include.keys([
        'framesPerSecond', 'cpuFrequency', 'ppuClipTopBottom', 'frameCounterMax4',
        'frameCounterMax5', 'noiseChannelTimerPeriods', 'dmcChannelTimerPeriods',
      ]);
    }
  });
});
