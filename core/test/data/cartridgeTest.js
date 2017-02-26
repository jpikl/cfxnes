import fs from 'fs';
import {expect} from 'chai';
import Mirroring from '../../src/common/Mirroring';
import Region from '../../src/common/Region';
import {readCartridge, createCartridge} from '../../src/data/cartridge';

describe('data/cartridge', () => {
  let romData;

  before(() => {
    romData = new Uint8Array(fs.readFileSync('./test/roms/nestest/nestest.nes'));
  });

  it('acceppts valid ROM image', () => {
    expect(createCartridge(romData)).to.be.an('object');
  });

  it('throws error for invalid ROM image', () => {
    expect(() => createCartridge()).to.throw('Invalid ROM image: undefined');
    expect(() => createCartridge(null)).to.throw('Invalid ROM image: null');
    expect(() => createCartridge('x')).to.throw('Invalid ROM image: "x"');
  });

  it('creates cartridge from valid ROM image', () => {
    const cartridge = createCartridge(romData);
    expect(cartridge).to.be.an('object');
    expect(cartridge.mapper).to.be.equal('NROM');
    expect(cartridge.submapper).to.be.undefined;
    expect(cartridge.region).to.be.equal(Region.NTSC);
    expect(cartridge.mirroring).to.be.equal(Mirroring.HORIZONTAL);
    expect(cartridge.prgROMSize).to.be.equal(0x4000);
    expect(cartridge.chrROMSize).to.be.equal(0x2000);
    expect(cartridge.prgRAMSize).to.be.equal(0x2000);
    expect(cartridge.chrRAMSize).to.be.equal(0);
    expect(cartridge.prgRAMSizeBattery).to.be.equal(0);
    expect(cartridge.chrRAMSizeBattery).to.be.equal(0);
    expect(cartridge.prgROM.length).to.be.equal(0x4000);
    expect(cartridge.chrROM.length).to.be.equal(0x2000);
  });

  it('throws error for invalid ROM image format', () => {
    expect(() => createCartridge(new Uint8Array(100))).to.throw('Unknown ROM image format');
  });

  it('computes SHA-1', () => {
    const cartridge = createCartridge(romData);
    expect(cartridge.sha1).to.be.equal('4131307f0f69f2a5c54b7d438328c5b2a5ed0820');
  });

  it('reads cartridge from file', () => {
    const cartridge1 = readCartridge('./test/roms/nestest/nestest.nes');
    const cartridge2 = createCartridge(romData);
    expect(cartridge1).to.deep.equal(cartridge2);
  });
});
