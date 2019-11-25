import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Region, Mirroring} from '../../src/common';
import read from '../../src/cartridge/read';

describe('cartridge/read', () => {
  it('reads cartridge from file', () => {
    const cartridge = read('./test/roms/nestest/nestest.nes');
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
