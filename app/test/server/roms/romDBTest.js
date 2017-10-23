import path from 'path';
import touch from 'touch';
import {expect} from 'chai';
import RomDB from '../../../src/server/roms/RomDB';
import {recursiveAsyncCall} from '../../../../lib/test/utils';

describe('server/roms/RomDB', () => {
  const resolveFile = name => path.resolve(__dirname, name);
  let romDB;

  beforeEach(() => {
    romDB = new RomDB(__dirname, {reloadDelay: 0});
  });

  afterEach(() => {
    romDB.stop();
  });

  it('returns no data when uninitialized', () => {
    expect(romDB.getRoms()).to.be.an('array').that.is.empty;
    expect(romDB.getRom('x')).to.be.undefined;
    expect(romDB.getFile('x')).to.be.undefined;
  });

  it('returns found ROMs', () => {
    romDB.reload();
    expect(romDB.getRoms()).to.deep.equal([
      {
        id: 'nestest',
        name: 'nestest',
        file: '/api/roms/files/nestest.nes',
        thumbnail: '/api/roms/files/nestest.jpg',
      },
      {
        id: 'nestress',
        name: 'NEStress',
        file: '/api/roms/files/NEStress.NES',
      },
    ]);
  });

  it('returns ROM by its ID', () => {
    romDB.reload();
    expect(romDB.getRom('x')).to.be.undefined;
    expect(romDB.getRom('nestest')).to.deep.equal({
      id: 'nestest',
      name: 'nestest',
      file: '/api/roms/files/nestest.nes',
      thumbnail: '/api/roms/files/nestest.jpg',
    });
    expect(romDB.getRom('nestress')).to.deep.equal({
      id: 'nestress',
      name: 'NEStress',
      file: '/api/roms/files/NEStress.NES',
    });
  });

  it('returns ROM file by its name', () => {
    romDB.reload();
    expect(romDB.getFile('x.nes')).to.be.undefined;
    expect(romDB.getFile('nestest.nes')).to.be.equal(resolveFile('nestest.nes'));
    expect(romDB.getFile('nestest.jpg')).to.be.equal(resolveFile('nestest.jpg'));
    expect(romDB.getFile('NEStress.NES')).to.be.equal(resolveFile('NEStress.NES'));
  });

  it('increments counter upon reload', () => {
    expect(romDB.reloadsCount).to.be.equal(0);
    romDB.reload();
    expect(romDB.reloadsCount).to.be.equal(1);
    romDB.reload();
    expect(romDB.reloadsCount).to.be.equal(2);
  });

  it('starts/stops watching changes in directory', done => {
    expect(romDB.reloadsCount).to.be.equal(0);
    romDB.start();
    expect(romDB.reloadsCount).to.be.equal(1);
    touch.sync(resolveFile('nestest.nes'));

    recursiveAsyncCall(done, 20, () => {
      expect(romDB.reloadsCount).to.be.equal(2);
      romDB.stop();
      touch.sync(resolveFile('nestest.nes'));
      expect(romDB.reloadsCount).to.be.equal(2);
    }, () => {
      expect(romDB.reloadsCount).to.be.equal(2);
    });
  });
});
