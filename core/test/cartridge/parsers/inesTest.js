import {expect} from 'chai';
import {Region, Mirroring, MapperType} from '../../../src/common';
import {parse} from '../../../src/cartridge/parsers/ines';
import {createINes as create} from '../utils';

describe('cartridge/parsers/ines (iNES input)', () => {
  function test(params = {}) {
    return parse(create(params));
  }

  it('accepts valid input', () => {
    expect(test()).to.be.an('object');
  });

  it('throws error for invalid input', () => {
    expect(() => parse(new Uint8Array(100))).to.throw('Incorrect signature');
    expect(() => parse(create().subarray(0, 15))).to.throw('Input is too short: expected at least 16 B but got 15 B');
    expect(() => parse(create().subarray(0, 20))).to.throw('Input is too short: expected at least 24.015 KB but got 20 B');
  });

  it('detects correct version', () => {
    // Bits (2, 3) of byte 7 are used to detect NES 2.0 format.
    // The should be unused by regular iNES ROMs. However, some ROMs
    // have them set to non-zero value. Unless these bits are equal
    // to 10 (NES 2.0 indication), their value must be ignored.
    expect(test({nes2DetectionBits: 0x0}).version).to.equal(1); // Bits = 00
    expect(test({nes2DetectionBits: 0x1}).version).to.equal(1); // Bits = 01
    expect(test({nes2DetectionBits: 0x3}).version).to.equal(1); // Bits = 11
  });

  it('throws error for zero PRG RAM', () => {
    expect(() => test({prgRomUnits: 0})).to.throw('Invalid header: 0 PRG ROM units');
  });

  it('reads PRG ROM size', () => {
    expect(test({prgRomUnits: 1}).prgRomSize).to.equal(0x4000);
    expect(test({prgRomUnits: 2}).prgRomSize).to.equal(0x8000);
    expect(test({prgRomUnits: 0xFF}).prgRomSize).to.equal(0x3FC000);
  });

  it('reads PRG ROM', () => {
    expect(test({prgRomUnits: 1}).prgRom).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({prgRomUnits: 2}).prgRom).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('reads PRG RAM size', () => {
    expect(test({prgRamUnits: 0}).prgRamSize).to.equal(0x2000);
    expect(test({prgRamUnits: 1}).prgRamSize).to.equal(0x2000);
    expect(test({prgRamUnits: 2}).prgRamSize).to.equal(0x4000);
    expect(test({prgRamUnits: 0xFF}).prgRamSize).to.equal(0x1FE000);
  });

  it('reads battery-backed PRG RAM size as 0', () => {
    expect(test().prgRamSizeBattery).to.equal(0);
  });

  it('reads CHR ROM size', () => {
    expect(test({chrRomUnits: 0}).chrRomSize).to.equal(0);
    expect(test({chrRomUnits: 1}).chrRomSize).to.equal(0x2000);
    expect(test({chrRomUnits: 2}).chrRomSize).to.equal(0x4000);
    expect(test({chrRomUnits: 0xFF}).chrRomSize).to.equal(0x1FE000);
  });

  it('reads CHR ROM', () => {
    expect(test({chrRomUnits: 0}).chrRom).to.be.undefined;
    expect(test({chrRomUnits: 1}).chrRom).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(test({chrRomUnits: 2}).chrRom).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('reads CHR RAM size', () => {
    expect(test({chrRomUnits: 0}).chrRamSize).to.equal(0x2000);
    expect(test({chrRomUnits: 1}).chrRamSize).to.equal(0);
  });

  it('reads battery-backed CHR RAM size as 0', () => {
    expect(test().chrRamSizeBattery).to.equal(0);
  });

  it('skips trainer', () => {
    expect(test({hasTrainer: true}).prgRom).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({hasTrainer: true}).chrRom).to.deep.equal(new Uint8Array(0x2000).fill(2));
  });

  it('reads mirroring', () => {
    expect(test({fourScreenMode: false, verticalMirroring: false}).mirroring).to.equal(Mirroring.HORIZONTAL);
    expect(test({fourScreenMode: false, verticalMirroring: true}).mirroring).to.equal(Mirroring.VERTICAL);
    expect(test({fourScreenMode: true, verticalMirroring: false}).mirroring).to.equal(Mirroring.FOUR_SCREEN);
    expect(test({fourScreenMode: true, verticalMirroring: true}).mirroring).to.equal(Mirroring.FOUR_SCREEN);
  });

  it('reads region', () => {
    expect(test({palRegion: false}).region).to.equal(Region.NTSC);
    expect(test({palRegion: true}).region).to.equal(Region.PAL);
  });

  it('reads mapper', () => {
    expect(test({mapperId: 0}).mapper).to.equal(MapperType.NROM);
    expect(test({mapperId: 1}).mapper).to.equal(MapperType.MMC1);
    expect(test({mapperId: 2}).mapper).to.equal(MapperType.UNROM);
    expect(test({mapperId: 3}).mapper).to.equal(MapperType.CNROM);
    expect(test({mapperId: 4}).mapper).to.equal(MapperType.MMC3);
    expect(test({mapperId: 7}).mapper).to.equal(MapperType.AOROM);
    expect(test({mapperId: 11}).mapper).to.equal(MapperType.COLOR_DREAMS);
    expect(test({mapperId: 34, chrRomUnits: 0}).mapper).to.equal(MapperType.BNROM);
    expect(test({mapperId: 34, chrRomUnits: 1}).mapper).to.equal(MapperType.NINA_001);
  });

  it('reads unknown mapper ID as string', () => {
    expect(test({mapperId: 0xFE}).mapper).to.equal(String(0xFE));
  });

  it('does not read submapper', () => {
    expect(test().submapper).to.be.undefined;
  });
});
