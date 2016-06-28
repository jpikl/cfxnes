/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect, CFxNES */

describe('CFxNES', () => {
  let cfxnes;

  beforeEach(() => {
    cfxnes = new CFxNES;
  });

  it('should download ROM image', () => {
    expect(cfxnes.isROMLoaded()).to.be.false;
    return expect(cfxnes.loadROM('/roms/nestest.nes')
      .then(() => cfxnes.isROMLoaded()))
      .to.eventually.be.true;
  });
});
