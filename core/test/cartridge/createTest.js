import fs from 'fs';
import {describe, it, before} from 'mocha';
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
    expect(cartridge.mapper).to.equal('NROM');
    expect(cartridge.submapper).to.be.undefined;
    expect(cartridge.region).to.equal(Region.NTSC);
    expect(cartridge.mirroring).to.equal(Mirroring.HORIZONTAL);
    expect(cartridge.prgRomSize).to.equal(0x4000);
    expect(cartridge.chrRomSize).to.equal(0x2000);
    expect(cartridge.prgRamSize).to.equal(0x2000);
    expect(cartridge.chrRamSize).to.equal(0);
    expect(cartridge.prgRamSizeBattery).to.equal(0);
    expect(cartridge.chrRamSizeBattery).to.equal(0);
    expect(cartridge.prgRom.length).to.equal(0x4000);
    expect(cartridge.chrRom.length).to.equal(0x2000);
    expect(cartridge.sha1).to.equal('4131307f0f69f2a5c54b7d438328c5b2a5ed0820');
  });
});
