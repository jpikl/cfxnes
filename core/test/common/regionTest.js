import {expect} from 'chai';
import Region from '../../src/common/Region';

describe('common/Region', () => {
  const regions = [Region.NTSC, Region.PAL];

  it('has string values', () => {
    for (const region of regions) {
      expect(region).to.be.a('string');
    }
  });

  it('provides parameters for each value', () => {
    for (const region of regions) {
      const params = Region.getParams(region);
      expect(params).to.be.an('object');
      expect(params).to.include.keys([
        'framesPerSecond', 'cpuFrequency', 'ppuClipTopBottom', 'frameCounterMax4',
        'frameCounterMax5', 'noiseChannelTimerPeriods', 'dmcChannelTimerPeriods',
      ]);
    }
  });

  it('throws error when getting parameters for invalid value', () => {
    expect(() => Region.getParams()).to.throw('Invalid region: undefined');
    expect(() => Region.getParams('x')).to.throw('Invalid region: "x"');
  });
});
