import {expect} from 'chai';
import Region from '../../src/common/Region';

describe('common/regions', () => {
  const paramsKeys = [
    'framesPerSecond',
    'cpuFrequency',
    'ppuClipTopBottom',
    'frameCounterMax4',
    'frameCounterMax5',
    'noiseTimerPeriods',
    'dmcTimerPeriods',
  ];

  it('provides parameters for each value', () => {
    expect(Region.getParams(Region.NTSC)).to.be.an('object').with.keys(paramsKeys);
    expect(Region.getParams(Region.PAL)).to.be.an('object').with.keys(paramsKeys);
  });

  it('throws error when getting parameters for invalid value', () => {
    expect(() => Region.getParams()).to.throw('Invalid region: undefined');
    expect(() => Region.getParams('x')).to.throw('Invalid region: "x"');
  });
});
