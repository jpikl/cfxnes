import {expect} from 'chai';
import {Region, Mirroring} from '../../src/common';
import read from '../../src/cartridge/read';

describe('cartridge/read', () => {
  it('reads cartridge from file', () => {
    const cartridge = read('./test/roms/nestest/nestest.nes');
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
