import {expect} from 'chai';
import Mirroring from '../../src/common/Mirroring';
import Region from '../../src/common/Region';
import inesParser from '../../src/data/inesParser';
import {createNES2 as create} from './utils';

describe('data/inesParser (NES 2.0 input)', () => {
  const {parse} = inesParser;

  function test(params = {}) {
    return parse(create(params));
  }

  it('accepts valid input', () => {
    expect(test()).to.be.an('object');
  });

  it('throws error for invalid input', () => {
    expect(() => parse(new Uint8Array(100))).to.throw('Incorrect signature');
    expect(() => parse(create().subarray(0, 4))).to.throw('Input is too short');
    expect(() => parse(create().subarray(0, 16))).to.throw('Input is too short');
    expect(() => parse(create().subarray(0, 20))).to.throw('Input is too short');
  });

  it('throws error for zero PRG RAM', () => {
    expect(() => test({prgROMUnits: 0})).to.throw('Invalid header: 0 PRG ROM units');
  });

  it('reads PRG ROM size', () => {
    expect(test({prgROMUnits: 1}).prgROMSize).to.be.equal(0x4000);
    expect(test({prgROMUnits: 2}).prgROMSize).to.be.equal(0x8000);
    expect(test({prgROMUnits: 0x111}).prgROMSize).to.be.equal(0x444000);
  });

  it('reads PRG ROM', () => {
    expect(test({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('reads PRG RAM size', () => {
    expect(test({prgRAMUnits: 0}).prgRAMSize).to.be.equal(0);
    expect(test({prgRAMUnits: 1}).prgRAMSize).to.be.equal(0x80);
    expect(test({prgRAMUnits: 2}).prgRAMSize).to.be.equal(0x100);
    expect(test({prgRAMUnits: 14}).prgRAMSize).to.be.equal(0x100000);
  });

  it('reads battery-backed PRG RAM size', () => {
    expect(test({prgRAMUnitsBattery: 0}).prgRAMSizeBattery).to.be.equal(0);
    expect(test({prgRAMUnitsBattery: 1}).prgRAMSizeBattery).to.be.equal(0x80);
    expect(test({prgRAMUnitsBattery: 2}).prgRAMSizeBattery).to.be.equal(0x100);
    expect(test({prgRAMUnitsBattery: 14}).prgRAMSizeBattery).to.be.equal(0x100000);
  });

  it('reads total PRG RAM size', () => {
    expect(test({prgRAMUnits: 0, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0);
    expect(test({prgRAMUnits: 0, prgRAMUnitsBattery: 1}).prgRAMSize).to.be.equal(0x80);
    expect(test({prgRAMUnits: 2, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0x100);
    expect(test({prgRAMUnits: 3, prgRAMUnitsBattery: 4}).prgRAMSize).to.be.equal(0x600);
  });

  it('reads CHR ROM size', () => {
    expect(test({chrROMUnits: 0}).chrROMSize).to.be.equal(0);
    expect(test({chrROMUnits: 1}).chrROMSize).to.be.equal(0x2000);
    expect(test({chrROMUnits: 2}).chrROMSize).to.be.equal(0x4000);
    expect(test({chrROMUnits: 0x111}).chrROMSize).to.be.equal(0x222000);
  });

  it('reads CHR ROM', () => {
    expect(test({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(test({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(test({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('reads CHR RAM size', () => {
    expect(test({chrRAMUnits: 0}).chrRAMSize).to.be.equal(0);
    expect(test({chrRAMUnits: 1}).chrRAMSize).to.be.equal(0x80);
    expect(test({chrRAMUnits: 2}).chrRAMSize).to.be.equal(0x100);
    expect(test({chrRAMUnits: 14}).chrRAMSize).to.be.equal(0x100000);
  });

  it('reads battery-backed CHR RAM size', () => {
    expect(test({chrRAMUnitsBattery: 0}).chrRAMSizeBattery).to.be.equal(0);
    expect(test({chrRAMUnitsBattery: 1}).chrRAMSizeBattery).to.be.equal(0x80);
    expect(test({chrRAMUnitsBattery: 2}).chrRAMSizeBattery).to.be.equal(0x100);
    expect(test({chrRAMUnitsBattery: 14}).chrRAMSizeBattery).to.be.equal(0x100000);
  });

  it('reads total CHR RAM size', () => {
    expect(test({chrRAMUnits: 0, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0);
    expect(test({chrRAMUnits: 0, chrRAMUnitsBattery: 1}).chrRAMSize).to.be.equal(0x80);
    expect(test({chrRAMUnits: 2, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0x100);
    expect(test({chrRAMUnits: 3, chrRAMUnitsBattery: 4}).chrRAMSize).to.be.equal(0x600);
  });

  it('skips trainer', () => {
    expect(test({hasTrainer: true}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(test({hasTrainer: true}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
  });

  it('reads mirroring', () => {
    expect(test({fourScreenMode: false, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.HORIZONTAL);
    expect(test({fourScreenMode: false, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.VERTICAL);
    expect(test({fourScreenMode: true, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
    expect(test({fourScreenMode: true, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
  });

  it('reads region', () => {
    expect(test({palRegion: false}).region).to.be.equal(Region.NTSC);
    expect(test({palRegion: true}).region).to.be.equal(Region.PAL);
  });

  it('reads mapper', () => {
    expect(test({mapperId: 0}).mapper).to.be.equal('NROM');
    expect(test({mapperId: 1}).mapper).to.be.equal('MMC1');
    expect(test({mapperId: 2}).mapper).to.be.equal('UNROM');
    expect(test({mapperId: 3}).mapper).to.be.equal('CNROM');
    expect(test({mapperId: 4}).mapper).to.be.equal('MMC3');
    expect(test({mapperId: 7}).mapper).to.be.equal('AOROM');
    expect(test({mapperId: 11}).mapper).to.be.equal('ColorDreams');
    expect(test({mapperId: 34, chrROMUnits: 0}).mapper).to.be.equal('BNROM');
    expect(test({mapperId: 34, chrROMUnits: 1}).mapper).to.be.equal('NINA-001');
  });

  it('reads unknown mapper ID as string', () => {
    expect(test({mapperId: 0xA81}).mapper).to.be.equal(String(0xA81));
  });

  it('reads submapper', () => {
    expect(test({mapperId: 1, submapperId: 1}).submapper).to.be.equal('SUROM');
    expect(test({mapperId: 1, submapperId: 2}).submapper).to.be.equal('SOROM');
    expect(test({mapperId: 1, submapperId: 3}).submapper).to.be.equal('SXROM');
  });

  it('does not read unknown submapper ID', () => {
    expect(test({mapperId: 1, submapperId: 0}).submapper).to.be.undefined;
    expect(test({mapperId: 1, submapperId: 15}).submapper).to.be.undefined;
    expect(test({mapperId: 0, submapperId: 1}).submapper).to.be.undefined;
  });
});
