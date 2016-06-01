/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect, CFxNES */

describe('CFxNES', () => {
  it('should initialize', () => {
    expect(new CFxNES).to.be.instanceof(CFxNES);
  });

  it('should download ROM image', () => {
    const cfxnes = new CFxNES();
    expect(cfxnes.isROMLoaded()).to.be.false;
    return expect(cfxnes.loadROM('/roms/nestest.nes')
      .then(() => cfxnes.isROMLoaded()))
      .to.eventually.be.true;
  });
});
