/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import {Mirroring, Region} from '../../src/enums';
import inesParser from '../../src/parsers/inesParser';

const expect = chai.expect;
const parseROM = inesParser.parse;

describe('inesParser (NES 2.0 input)', () => {
  it('should accept valid input', () => {
    expect(testROM()).to.be.an('object');
  });

  it('should throw error for invalid input', () => {
    expect(() => parseROM(new Uint8Array(100))).to.throw(Error);
    expect(() => parseROM(createROM().subarray(0, 4))).to.throw(Error);
    expect(() => parseROM(createROM().subarray(0, 16))).to.throw(Error);
    expect(() => parseROM(createROM().subarray(0, 20))).to.throw(Error);
  });

  it('should read PRG ROM size', () => {
    expect(testROM({prgROMUnits: 1}).prgROMSize).to.be.equal(0x4000);
    expect(testROM({prgROMUnits: 2}).prgROMSize).to.be.equal(0x8000);
    expect(testROM({prgROMUnits: 0x111}).prgROMSize).to.be.equal(0x444000);
  });

  it('should read PRG ROM', () => {
    expect(testROM({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(testROM({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('should read PRG RAM size', () => {
    expect(testROM({prgRAMUnits: 0}).prgRAMSize).to.be.equal(0);
    expect(testROM({prgRAMUnits: 1}).prgRAMSize).to.be.equal(0x80);
    expect(testROM({prgRAMUnits: 2}).prgRAMSize).to.be.equal(0x100);
    expect(testROM({prgRAMUnits: 14}).prgRAMSize).to.be.equal(0x100000);
  });

  it('should read battery-backed PRG RAM size', () => {
    expect(testROM({prgRAMUnitsBattery: 0}).prgRAMSizeBattery).to.be.equal(0);
    expect(testROM({prgRAMUnitsBattery: 1}).prgRAMSizeBattery).to.be.equal(0x80);
    expect(testROM({prgRAMUnitsBattery: 2}).prgRAMSizeBattery).to.be.equal(0x100);
    expect(testROM({prgRAMUnitsBattery: 14}).prgRAMSizeBattery).to.be.equal(0x100000);
  });

  it('should read total PRG RAM size', () => {
    expect(testROM({prgRAMUnits: 0, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0);
    expect(testROM({prgRAMUnits: 0, prgRAMUnitsBattery: 1}).prgRAMSize).to.be.equal(0x80);
    expect(testROM({prgRAMUnits: 2, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0x100);
    expect(testROM({prgRAMUnits: 3, prgRAMUnitsBattery: 4}).prgRAMSize).to.be.equal(0x600);
  });

  it('should read CHR ROM size', () => {
    expect(testROM({chrROMUnits: 0}).chrROMSize).to.be.equal(0);
    expect(testROM({chrROMUnits: 1}).chrROMSize).to.be.equal(0x2000);
    expect(testROM({chrROMUnits: 2}).chrROMSize).to.be.equal(0x4000);
    expect(testROM({chrROMUnits: 0x111}).chrROMSize).to.be.equal(0x222000);
  });

  it('should read CHR ROM', () => {
    expect(testROM({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(testROM({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(testROM({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('should read CHR RAM size', () => {
    expect(testROM({chrRAMUnits: 0}).chrRAMSize).to.be.equal(0);
    expect(testROM({chrRAMUnits: 1}).chrRAMSize).to.be.equal(0x80);
    expect(testROM({chrRAMUnits: 2}).chrRAMSize).to.be.equal(0x100);
    expect(testROM({chrRAMUnits: 14}).chrRAMSize).to.be.equal(0x100000);
  });

  it('should read battery-backed CHR RAM size', () => {
    expect(testROM({chrRAMUnitsBattery: 0}).chrRAMSizeBattery).to.be.equal(0);
    expect(testROM({chrRAMUnitsBattery: 1}).chrRAMSizeBattery).to.be.equal(0x80);
    expect(testROM({chrRAMUnitsBattery: 2}).chrRAMSizeBattery).to.be.equal(0x100);
    expect(testROM({chrRAMUnitsBattery: 14}).chrRAMSizeBattery).to.be.equal(0x100000);
  });

  it('should read total CHR RAM size', () => {
    expect(testROM({chrRAMUnits: 0, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0);
    expect(testROM({chrRAMUnits: 0, chrRAMUnitsBattery: 1}).chrRAMSize).to.be.equal(0x80);
    expect(testROM({chrRAMUnits: 2, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0x100);
    expect(testROM({chrRAMUnits: 3, chrRAMUnitsBattery: 4}).chrRAMSize).to.be.equal(0x600);
  });

  it('should skip trainer', () => {
    expect(testROM({hasTrainer: true}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(testROM({hasTrainer: true}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
  });

  it('should read mirroring', () => {
    expect(testROM({fourScreenMode: false, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.HORIZONTAL);
    expect(testROM({fourScreenMode: false, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.VERTICAL);
    expect(testROM({fourScreenMode: true, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
    expect(testROM({fourScreenMode: true, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
  });

  it('should read region', () => {
    expect(testROM({palRegion: false}).region).to.be.equal(Region.NTSC);
    expect(testROM({palRegion: true}).region).to.be.equal(Region.PAL);
  });

  it('should read mapper', () => {
    expect(testROM({mapperId: 0}).mapper).to.be.equal('NROM');
    expect(testROM({mapperId: 1}).mapper).to.be.equal('MMC1');
    expect(testROM({mapperId: 2}).mapper).to.be.equal('UNROM');
    expect(testROM({mapperId: 3}).mapper).to.be.equal('CNROM');
    expect(testROM({mapperId: 4}).mapper).to.be.equal('MMC3');
    expect(testROM({mapperId: 7}).mapper).to.be.equal('AOROM');
    expect(testROM({mapperId: 11}).mapper).to.be.equal('ColorDreams');
    expect(testROM({mapperId: 34, chrROMUnits: 0}).mapper).to.be.equal('BNROM');
    expect(testROM({mapperId: 34, chrROMUnits: 1}).mapper).to.be.equal('NINA-001');
  });

  it('should read unknown mapper ID as string', () => {
    expect(testROM({mapperId: 0xA81}).mapper).to.be.equal(String(0xA81));
  });

  it('should read submapper', () => {
    expect(testROM({mapperId: 1, submapperId: 1}).submapper).to.be.equal('SUROM');
    expect(testROM({mapperId: 1, submapperId: 2}).submapper).to.be.equal('SOROM');
    expect(testROM({mapperId: 1, submapperId: 3}).submapper).to.be.equal('SXROM');
  });

  it('should not read unknown submapper ID', () => {
    expect(testROM({mapperId: 1, submapperId: 0}).submapper).to.be.undefined;
    expect(testROM({mapperId: 1, submapperId: 15}).submapper).to.be.undefined;
    expect(testROM({mapperId: 0, submapperId: 1}).submapper).to.be.undefined;
  });
});

function testROM(params = {}) {
  return parseROM(createROM(params));
}

function createROM({prgROMUnits = 1,
                    prgRAMUnits = 0,
                    prgRAMUnitsBattery = 0,
                    chrROMUnits = 1,
                    chrRAMUnits = 0,
                    chrRAMUnitsBattery = 0,
                    hasPRGRAMBattery = false,
                    hasTrainer = false,
                    verticalMirroring = false,
                    fourScreenMode = false,
                    palRegion = false,
                    mapperId = 0,
                    submapperId = 0}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgROMUnits & 0xFF,
    chrROMUnits & 0xFF,
    (mapperId << 4) & 0xF0 | fourScreenMode << 3 | hasTrainer << 2 | hasPRGRAMBattery << 1 | verticalMirroring << 0,
    mapperId & 0xF0 | 0x08,
    (submapperId << 4) & 0xF0 | (mapperId >>> 8) & 0x0F,
    (chrROMUnits >>> 4) & 0xF0 | (prgROMUnits >>> 8) & 0x0F,
    (prgRAMUnitsBattery << 4) & 0xF0 | prgRAMUnits & 0x0F,
    (chrRAMUnitsBattery << 4) & 0xF0 | chrRAMUnits & 0x0F,
    palRegion & 0x01,
    0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgROM = new Uint8Array(prgROMUnits * 0x4000).fill(1);
  const chrROM = new Uint8Array(chrROMUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}
