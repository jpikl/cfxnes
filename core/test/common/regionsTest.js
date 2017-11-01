import {expect} from 'chai';
import {NTSC, PAL, getParams} from '../../src/common/regions';

describe('common/regions', () => {
  const regions = [NTSC, PAL];

  it('has string values', () => {
    for (const region of regions) {
      expect(region).to.be.a('string');
    }
  });

  it('provides parameters for each value', () => {
    for (const region of regions) {
      const params = getParams(region);
      expect(params).to.be.an('object').with.keys([
        'framesPerSecond', 'cpuFrequency', 'ppuClipTopBottom', 'frameCounterMax4',
        'frameCounterMax5', 'noiseChannelTimerPeriods', 'dmcChannelTimerPeriods',
      ]);
    }
  });

  it('throws error when getting parameters for invalid value', () => {
    expect(() => getParams()).to.throw('Invalid region: undefined');
    expect(() => getParams('x')).to.throw('Invalid region: "x"');
  });
});
