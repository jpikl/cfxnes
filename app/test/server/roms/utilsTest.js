import {expect} from 'chai';
import {isRomFile, getRomId, getRomName, compareRomsByName, findRomThumbFile, getPublicFileName} from '../../../src/server/roms/utils';
import {NESTEST_ROM_PATH, NESTEST_THUMB_PATH, NESTRESS_ROM_PATH} from '../fixtures';

describe('server/roms/utils', () => {
  it('detects ROM file', () => {
    expect(isRomFile(NESTEST_THUMB_PATH)).to.be.false;
    expect(isRomFile(NESTEST_ROM_PATH)).to.be.true;
    expect(isRomFile(NESTRESS_ROM_PATH)).to.be.true;
  });

  it('returns ROM ID', () => {
    expect(getRomId('/path/to/dir/ Test ROM-File_.nes')).to.equal('test-rom-file');
  });

  it('returns ROM name', () => {
    expect(getRomName('/path/to/dir/ Test ROM-File_.nes')).to.equal('Test ROM-File_');
  });

  it('compares ROMs by name', () => {
    const r1 = {name: 'A'};
    const r2 = {name: 'The B'};
    const r3 = {name: 'C1'};
    const r4 = {name: 'the C2'};
    const roms = [r4, r3, r2, r1];
    roms.sort(compareRomsByName);
    expect(roms).to.have.ordered.members([r1, r2, r3, r4]);
  });

  it('finds ROM thumbnail', () => {
    expect(findRomThumbFile(NESTRESS_ROM_PATH)).to.be.null;
    expect(findRomThumbFile(NESTEST_ROM_PATH)).to.equal(NESTEST_THUMB_PATH);
  });

  it('returns public filename', () => {
    expect(getPublicFileName('/path/to/dir/ Test ROM-File_.PNG')).to.equal('Test_ROM_File.png');
  });
});
