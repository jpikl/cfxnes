/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect, CFxNES */

describe('CFxNES', () => {
  let cfxnes;

  beforeEach(() => {
    cfxnes = new CFxNES;
  });

  it('downloads ROM image', () => {
    expect(cfxnes.isROMLoaded()).to.be.false;
    const result = cfxnes.loadROM('/roms/nestest.nes')
      .then(() => cfxnes.isROMLoaded());
    expect(result).to.eventually.be.true;
  });
});
