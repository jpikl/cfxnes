import path from 'path';
import {expect} from 'chai';
import {isRomFile, getRomId, getRomName, compareRomsByName, findRomThumbFile, getPublicFileName} from '../../../src/server/roms/utils';

describe('server/roms/utils', () => {
  const resolveFile = name => path.resolve(__dirname, name);

  it('detects ROM file', () => {
    expect(isRomFile(resolveFile('x'))).to.be.false;
    expect(isRomFile(resolveFile('x.png'))).to.be.false;
    expect(isRomFile(resolveFile('x.nes'))).to.be.true;
    expect(isRomFile(resolveFile('x.NES'))).to.be.true;
  });

  it('returns ROM ID', () => {
    expect(getRomId(resolveFile('Test ROM_File.nes'))).to.be.equal('test-rom-file');
  });

  it('returns ROM name', () => {
    expect(getRomName(resolveFile('Test ROM_File.nes'))).to.be.equal('Test ROM_File');
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
    expect(findRomThumbFile(resolveFile('x.nes'))).to.be.null;
    expect(findRomThumbFile(resolveFile('nestest.nes'))).to.be.equal(resolveFile('nestest.jpg'));
  });

  it('returns public filename', () => {
    expect(getPublicFileName('/path/to/dir/ New Test-File - X_.png')).to.be.equal('New_Test_File_X.png');
  });
});
