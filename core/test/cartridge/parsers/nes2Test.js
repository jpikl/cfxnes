import {expect} from 'chai';
import {Region, Mirroring, Mapper, Submapper} from '../../../src/common';
import {parse} from '../../../src/cartridge/parsers/ines';
import {createNes2 as create} from '../utils';

describe('cartridge/parsers/ines (NES 2.0 input)', () => {
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
    expect(test().version).to.equal(2);
  });

  it('throws error for zero PRG RAM', () => {
    expect(() => test({prgRomUnits: 0})).to.throw('Invalid header: 0 PRG ROM units');
  });

  it('reads PRG ROM size', () => {
    expect(test({prgRomUnits: 1}).prgRomSize).to.equal(0x4000);
    expect(test({prgRomUnits: 2}).prgRomSize).to.equal(0x8000);
    expect(test({prgRomUnits: 0x111}).prgRomSize).to.equal(0x444000);
  });

  it('reads PRG ROM', () => {
    expect(test({prgRomUnits: 1}).prgRom).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({prgRomUnits: 2}).prgRom).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('reads PRG RAM size', () => {
    expect(test({prgRamUnits: 0}).prgRamSize).to.equal(0);
    expect(test({prgRamUnits: 1}).prgRamSize).to.equal(0x80);
    expect(test({prgRamUnits: 2}).prgRamSize).to.equal(0x100);
    expect(test({prgRamUnits: 14}).prgRamSize).to.equal(0x100000);
  });

  it('reads battery-backed PRG RAM size', () => {
    expect(test({prgRamUnitsBattery: 0}).prgRamSizeBattery).to.equal(0);
    expect(test({prgRamUnitsBattery: 1}).prgRamSizeBattery).to.equal(0x80);
    expect(test({prgRamUnitsBattery: 2}).prgRamSizeBattery).to.equal(0x100);
    expect(test({prgRamUnitsBattery: 14}).prgRamSizeBattery).to.equal(0x100000);
  });

  it('reads total PRG RAM size', () => {
    expect(test({prgRamUnits: 0, prgRamUnitsBattery: 0}).prgRamSize).to.equal(0);
    expect(test({prgRamUnits: 0, prgRamUnitsBattery: 1}).prgRamSize).to.equal(0x80);
    expect(test({prgRamUnits: 2, prgRamUnitsBattery: 0}).prgRamSize).to.equal(0x100);
    expect(test({prgRamUnits: 3, prgRamUnitsBattery: 4}).prgRamSize).to.equal(0x600);
  });

  it('reads CHR ROM size', () => {
    expect(test({chrRomUnits: 0}).chrRomSize).to.equal(0);
    expect(test({chrRomUnits: 1}).chrRomSize).to.equal(0x2000);
    expect(test({chrRomUnits: 2}).chrRomSize).to.equal(0x4000);
    expect(test({chrRomUnits: 0x111}).chrRomSize).to.equal(0x222000);
  });

  it('reads CHR ROM', () => {
    expect(test({chrRomUnits: 0}).chrRom).to.be.undefined;
    expect(test({chrRomUnits: 1}).chrRom).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(test({chrRomUnits: 2}).chrRom).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('reads CHR RAM size', () => {
    expect(test({chrRamUnits: 0}).chrRamSize).to.equal(0);
    expect(test({chrRamUnits: 1}).chrRamSize).to.equal(0x80);
    expect(test({chrRamUnits: 2}).chrRamSize).to.equal(0x100);
    expect(test({chrRamUnits: 14}).chrRamSize).to.equal(0x100000);
  });

  it('reads battery-backed CHR RAM size', () => {
    expect(test({chrRamUnitsBattery: 0}).chrRamSizeBattery).to.equal(0);
    expect(test({chrRamUnitsBattery: 1}).chrRamSizeBattery).to.equal(0x80);
    expect(test({chrRamUnitsBattery: 2}).chrRamSizeBattery).to.equal(0x100);
    expect(test({chrRamUnitsBattery: 14}).chrRamSizeBattery).to.equal(0x100000);
  });

  it('reads total CHR RAM size', () => {
    expect(test({chrRamUnits: 0, chrRamUnitsBattery: 0}).chrRamSize).to.equal(0);
    expect(test({chrRamUnits: 0, chrRamUnitsBattery: 1}).chrRamSize).to.equal(0x80);
    expect(test({chrRamUnits: 2, chrRamUnitsBattery: 0}).chrRamSize).to.equal(0x100);
    expect(test({chrRamUnits: 3, chrRamUnitsBattery: 4}).chrRamSize).to.equal(0x600);
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
    expect(test({mapperId: 0}).mapper).to.equal(Mapper.NROM);
    expect(test({mapperId: 1}).mapper).to.equal(Mapper.MMC1);
    expect(test({mapperId: 2}).mapper).to.equal(Mapper.UNROM);
    expect(test({mapperId: 3}).mapper).to.equal(Mapper.CNROM);
    expect(test({mapperId: 4}).mapper).to.equal(Mapper.MMC3);
    expect(test({mapperId: 7}).mapper).to.equal(Mapper.AOROM);
    expect(test({mapperId: 11}).mapper).to.equal(Mapper.COLOR_DREAMS);
    expect(test({mapperId: 34, chrRomUnits: 0}).mapper).to.equal(Mapper.BNROM);
    expect(test({mapperId: 34, chrRomUnits: 1}).mapper).to.equal(Mapper.NINA_001);
  });

  it('reads unknown mapper ID as string', () => {
    expect(test({mapperId: 0xA81}).mapper).to.equal(String(0xA81));
  });

  it('reads submapper', () => {
    expect(test({mapperId: 1, submapperId: 1}).submapper).to.equal(Submapper.SUROM);
    expect(test({mapperId: 1, submapperId: 2}).submapper).to.equal(Submapper.SOROM);
    expect(test({mapperId: 1, submapperId: 3}).submapper).to.equal(Submapper.SXROM);
  });

  it('does not read unknown submapper ID', () => {
    expect(test({mapperId: 1, submapperId: 0}).submapper).to.be.undefined;
    expect(test({mapperId: 1, submapperId: 15}).submapper).to.be.undefined;
    expect(test({mapperId: 0, submapperId: 1}).submapper).to.be.undefined;
  });
});
