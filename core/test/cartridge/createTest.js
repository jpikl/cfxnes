import fs from 'fs';
import {expect} from 'chai';
import {Region, Mirroring} from '../../src/common';
import create from '../../src/cartridge/create';

describe('cartridge/create', () => {
  let romData;

  before(() => {
    romData = new Uint8Array(fs.readFileSync('./test/roms/nestest/nestest.nes'));
  });

  it('throws error for invalid ROM image', () => {
    expect(() => create()).to.throw('Invalid ROM image: undefined');
    expect(() => create(null)).to.throw('Invalid ROM image: null');
    expect(() => create('x')).to.throw('Invalid ROM image: "x"');
  });

  it('throws error for invalid ROM image format', () => {
    expect(() => create(new Uint8Array(100))).to.throw('Unknown ROM image format');
  });

  it('creates cartridge from valid ROM image', () => {
    const cartridge = create(romData);
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
    expect(cartridge.sha1).to.be.equal('4131307f0f69f2a5c54b7d438328c5b2a5ed0820');
  });
});
