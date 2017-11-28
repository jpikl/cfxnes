import {expect} from 'chai';
import {Region, Mirroring, Mapper, Submapper} from '../../../src/common';
import {parse} from '../../../src/cartridge/parsers/ines';
import {createNES2 as create} from '../utils';

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
    expect(() => test({prgROMUnits: 0})).to.throw('Invalid header: 0 PRG ROM units');
  });

  it('reads PRG ROM size', () => {
    expect(test({prgROMUnits: 1}).prgROMSize).to.equal(0x4000);
    expect(test({prgROMUnits: 2}).prgROMSize).to.equal(0x8000);
    expect(test({prgROMUnits: 0x111}).prgROMSize).to.equal(0x444000);
  });

  it('reads PRG ROM', () => {
    expect(test({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('reads PRG RAM size', () => {
    expect(test({prgRAMUnits: 0}).prgRAMSize).to.equal(0);
    expect(test({prgRAMUnits: 1}).prgRAMSize).to.equal(0x80);
    expect(test({prgRAMUnits: 2}).prgRAMSize).to.equal(0x100);
    expect(test({prgRAMUnits: 14}).prgRAMSize).to.equal(0x100000);
  });

  it('reads battery-backed PRG RAM size', () => {
    expect(test({prgRAMUnitsBattery: 0}).prgRAMSizeBattery).to.equal(0);
    expect(test({prgRAMUnitsBattery: 1}).prgRAMSizeBattery).to.equal(0x80);
    expect(test({prgRAMUnitsBattery: 2}).prgRAMSizeBattery).to.equal(0x100);
    expect(test({prgRAMUnitsBattery: 14}).prgRAMSizeBattery).to.equal(0x100000);
  });

  it('reads total PRG RAM size', () => {
    expect(test({prgRAMUnits: 0, prgRAMUnitsBattery: 0}).prgRAMSize).to.equal(0);
    expect(test({prgRAMUnits: 0, prgRAMUnitsBattery: 1}).prgRAMSize).to.equal(0x80);
    expect(test({prgRAMUnits: 2, prgRAMUnitsBattery: 0}).prgRAMSize).to.equal(0x100);
    expect(test({prgRAMUnits: 3, prgRAMUnitsBattery: 4}).prgRAMSize).to.equal(0x600);
  });

  it('reads CHR ROM size', () => {
    expect(test({chrROMUnits: 0}).chrROMSize).to.equal(0);
    expect(test({chrROMUnits: 1}).chrROMSize).to.equal(0x2000);
    expect(test({chrROMUnits: 2}).chrROMSize).to.equal(0x4000);
    expect(test({chrROMUnits: 0x111}).chrROMSize).to.equal(0x222000);
  });

  it('reads CHR ROM', () => {
    expect(test({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(test({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(test({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('reads CHR RAM size', () => {
    expect(test({chrRAMUnits: 0}).chrRAMSize).to.equal(0);
    expect(test({chrRAMUnits: 1}).chrRAMSize).to.equal(0x80);
    expect(test({chrRAMUnits: 2}).chrRAMSize).to.equal(0x100);
    expect(test({chrRAMUnits: 14}).chrRAMSize).to.equal(0x100000);
  });

  it('reads battery-backed CHR RAM size', () => {
    expect(test({chrRAMUnitsBattery: 0}).chrRAMSizeBattery).to.equal(0);
    expect(test({chrRAMUnitsBattery: 1}).chrRAMSizeBattery).to.equal(0x80);
    expect(test({chrRAMUnitsBattery: 2}).chrRAMSizeBattery).to.equal(0x100);
    expect(test({chrRAMUnitsBattery: 14}).chrRAMSizeBattery).to.equal(0x100000);
  });

  it('reads total CHR RAM size', () => {
    expect(test({chrRAMUnits: 0, chrRAMUnitsBattery: 0}).chrRAMSize).to.equal(0);
    expect(test({chrRAMUnits: 0, chrRAMUnitsBattery: 1}).chrRAMSize).to.equal(0x80);
    expect(test({chrRAMUnits: 2, chrRAMUnitsBattery: 0}).chrRAMSize).to.equal(0x100);
    expect(test({chrRAMUnits: 3, chrRAMUnitsBattery: 4}).chrRAMSize).to.equal(0x600);
  });

  it('skips trainer', () => {
    expect(test({hasTrainer: true}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({hasTrainer: true}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
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
    expect(test({mapperId: 34, chrROMUnits: 0}).mapper).to.equal(Mapper.BNROM);
    expect(test({mapperId: 34, chrROMUnits: 1}).mapper).to.equal(Mapper.NINA_001);
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
