import touch from 'touch';
import {expect} from 'chai';
import RomDb from '../../../src/server/roms/RomDb';
import {recursiveAsyncCall} from '../../utils';
import {NESTEST_ROM_PATH, NESTEST_THUMB_PATH, NESTRESS_ROM_PATH, ROMS_PATH, roms} from '../fixtures';

describe('server/roms/RomDb', () => {
  let romDb;

  beforeEach(() => {
    romDb = new RomDb(ROMS_PATH, {reloadDelay: 0});
  });

  afterEach(() => {
    romDb.stop();
  });

  it('returns no data when uninitialized', () => {
    expect(romDb.getRoms()).to.be.an('array').that.is.empty;
    expect(romDb.getRom('x')).to.be.undefined;
    expect(romDb.getFile('x')).to.be.undefined;
  });

  it('returns found ROMs', () => {
    romDb.reload();
    expect(romDb.getRoms()).to.deep.equal(roms.all);
  });

  it('returns ROM by its ID', () => {
    romDb.reload();
    expect(romDb.getRom('x')).to.be.undefined;
    expect(romDb.getRom('nes-test')).to.deep.equal(roms.nestest);
    expect(romDb.getRom('nestress')).to.deep.equal(roms.nestress);
  });

  it('returns ROM file by its name', () => {
    romDb.reload();
    expect(romDb.getFile('x.nes')).to.be.undefined;
    expect(romDb.getFile('NES_Test.nes')).to.equal(NESTEST_ROM_PATH);
    expect(romDb.getFile('NES_Test.jpg')).to.equal(NESTEST_THUMB_PATH);
    expect(romDb.getFile('NEStress.nes')).to.equal(NESTRESS_ROM_PATH);
  });

  it('increments counter upon reload', () => {
    expect(romDb.reloadsCount).to.equal(0);
    romDb.reload();
    expect(romDb.reloadsCount).to.equal(1);
    romDb.reload();
    expect(romDb.reloadsCount).to.equal(2);
  });

  it('starts/stops watching changes in directory', done => {
    expect(romDb.reloadsCount).to.equal(0);
    romDb.start();
    expect(romDb.reloadsCount).to.equal(1);
    touch.sync(NESTEST_ROM_PATH);

    recursiveAsyncCall(done, 20, () => {
      expect(romDb.reloadsCount).to.equal(2);
      romDb.stop();
      touch.sync(NESTEST_ROM_PATH);
      expect(romDb.reloadsCount).to.equal(2);
    }, () => {
      expect(romDb.reloadsCount).to.equal(2);
    });
  });
});
