/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import {makeArray} from '../../src/utils/array';
import NES2Loader from '../../src/loaders/NES2Loader';
import Uint8ArrayReader from '../../src/readers/Uint8ArrayReader';
import Mirroring from '../../src/common/Mirroring';
import Region from '../../src/common/Region';

const expect = chai.expect;

describe('NES2 Loader', () => {
  it('should reject invalid image', () => {
    expect(readNES2(new Uint8Array(100))).to.be.null;
  });

  it('should accept valid image', () => {
    expect(testNES2({})).to.be.an('object');
  });

  it('should throw error for corrupted image', () => {
    expect(() => readNES2(makeNES2({}).subarray(0, 16))).to.throw(Error);
    expect(() => readNES2(makeNES2({}).subarray(0, 20))).to.throw(Error);
  });

  it('should detect trainer', () => {
    expect(testNES2({hasTrainer: false}).hasTrainer).to.be.false;
    expect(testNES2({hasTrainer: true}).hasTrainer).to.be.true;
  });

  it('should read trainer', () => {
    expect(testNES2({hasTrainer: false}).trainer).to.be.undefined;
    expect(testNES2({hasTrainer: true}).trainer).to.deep.equal(new Uint8Array(makeArray(512, 1)));
  });

  it('shoud read PRG ROM size', () => {
    expect(testNES2({prgROMUnits: 1}).prgROMSize).to.be.equal(0x4000);
    expect(testNES2({prgROMUnits: 2}).prgROMSize).to.be.equal(0x8000);
    expect(testNES2({prgROMUnits: 0x111}).prgROMSize).to.be.equal(0x444000);
  });

  it('shoud read PRG ROM', () => {
    expect(testNES2({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(makeArray(0x4000, 2)));
    expect(testNES2({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(makeArray(0x8000, 2)));
  });

  it('shoud detect PRG RAM', () => {
    expect(testNES2({prgRAMUnits: 0}).hasPRGRAM).to.be.false;
    expect(testNES2({prgRAMUnits: 1}).hasPRGRAM).to.be.true;
  });

  it('shoud detect battery-backed PRG RAM', () => {
    expect(testNES2({prgRAMUnitsBattery: 0}).hasPRGRAMBattery).to.be.false;
    expect(testNES2({prgRAMUnitsBattery: 1}).hasPRGRAMBattery).to.be.true;
  });

  it('shoud read PRG RAM size', () => {
    expect(testNES2({prgRAMUnits: 0}).prgRAMSize).to.be.equal(0);
    expect(testNES2({prgRAMUnits: 1}).prgRAMSize).to.be.equal(0x80);
    expect(testNES2({prgRAMUnits: 2}).prgRAMSize).to.be.equal(0x100);
    expect(testNES2({prgRAMUnits: 14}).prgRAMSize).to.be.equal(0x100000);
  });

  it('shoud read battery-backed PRG RAM size', () => {
    expect(testNES2({prgRAMUnitsBattery: 0}).prgRAMSizeBattery).to.be.equal(0);
    expect(testNES2({prgRAMUnitsBattery: 1}).prgRAMSizeBattery).to.be.equal(0x80);
    expect(testNES2({prgRAMUnitsBattery: 2}).prgRAMSizeBattery).to.be.equal(0x100);
    expect(testNES2({prgRAMUnitsBattery: 14}).prgRAMSizeBattery).to.be.equal(0x100000);
  });

  it('shoud read total PRG RAM size', () => {
    expect(testNES2({prgRAMUnits: 0, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0);
    expect(testNES2({prgRAMUnits: 0, prgRAMUnitsBattery: 1}).prgRAMSize).to.be.equal(0x80);
    expect(testNES2({prgRAMUnits: 2, prgRAMUnitsBattery: 0}).prgRAMSize).to.be.equal(0x100);
    expect(testNES2({prgRAMUnits: 3, prgRAMUnitsBattery: 4}).prgRAMSize).to.be.equal(0x600);
  });

  it('shoud detect CHR ROM', () => {
    expect(testNES2({chrROMUnits: 0}).hasCHRROM).to.be.false;
    expect(testNES2({chrROMUnits: 1}).hasCHRROM).to.be.true;
  });

  it('shoud read CHR ROM size', () => {
    expect(testNES2({chrROMUnits: 0}).chrROMSize).to.be.equal(0);
    expect(testNES2({chrROMUnits: 1}).chrROMSize).to.be.equal(0x2000);
    expect(testNES2({chrROMUnits: 2}).chrROMSize).to.be.equal(0x4000);
    expect(testNES2({chrROMUnits: 0x111}).chrROMSize).to.be.equal(0x222000);
  });

  it('shoud read CHR ROM', () => {
    expect(testNES2({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(testNES2({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(makeArray(0x2000, 3)));
    expect(testNES2({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(makeArray(0x4000, 3)));
  });

  it('shoud detect CHR RAM', () => {
    expect(testNES2({chrRAMUnits: 0}).hasCHRRAM).to.be.false;
    expect(testNES2({chrRAMUnits: 1}).hasCHRRAM).to.be.true;
  });

  it('shoud detect battery-backed CHR RAM', () => {
    expect(testNES2({chrRAMUnitsBattery: 0}).hasCHRRAMBattery).to.be.false;
    expect(testNES2({chrRAMUnitsBattery: 1}).hasCHRRAMBattery).to.be.true;
  });

  it('shoud read CHR RAM size', () => {
    expect(testNES2({chrRAMUnits: 0}).chrRAMSize).to.be.equal(0);
    expect(testNES2({chrRAMUnits: 1}).chrRAMSize).to.be.equal(0x80);
    expect(testNES2({chrRAMUnits: 2}).chrRAMSize).to.be.equal(0x100);
    expect(testNES2({chrRAMUnits: 14}).chrRAMSize).to.be.equal(0x100000);
  });

  it('shoud read battery-backed CHR RAM size', () => {
    expect(testNES2({chrRAMUnitsBattery: 0}).chrRAMSizeBattery).to.be.equal(0);
    expect(testNES2({chrRAMUnitsBattery: 1}).chrRAMSizeBattery).to.be.equal(0x80);
    expect(testNES2({chrRAMUnitsBattery: 2}).chrRAMSizeBattery).to.be.equal(0x100);
    expect(testNES2({chrRAMUnitsBattery: 14}).chrRAMSizeBattery).to.be.equal(0x100000);
  });

  it('shoud read total CHR RAM size', () => {
    expect(testNES2({chrRAMUnits: 0, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0);
    expect(testNES2({chrRAMUnits: 0, chrRAMUnitsBattery: 1}).chrRAMSize).to.be.equal(0x80);
    expect(testNES2({chrRAMUnits: 2, chrRAMUnitsBattery: 0}).chrRAMSize).to.be.equal(0x100);
    expect(testNES2({chrRAMUnits: 3, chrRAMUnitsBattery: 4}).chrRAMSize).to.be.equal(0x600);
  });

  it('shoud read mirroring', () => {
    expect(testNES2({fourScreenMode: false, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.HORIZONTAL);
    expect(testNES2({fourScreenMode: false, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.VERTICAL);
    expect(testNES2({fourScreenMode: true, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
    expect(testNES2({fourScreenMode: true, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
  });

  it('shoud read region', () => {
    expect(testNES2({palRegion: false}).region).to.be.equal(Region.NTSC);
    expect(testNES2({palRegion: true}).region).to.be.equal(Region.PAL);
  });

  it('shoud read mapper ID', () => {
    expect(testNES2({mapperId: 0xA81}).mapperId).to.be.equal(0xA81);
  });

  it('should detect correct mapper', () => {
    expect(testNES2({mapperId: 0}).mapper).to.be.equal('NROM');
    expect(testNES2({mapperId: 1}).mapper).to.be.equal('MMC1');
    expect(testNES2({mapperId: 2}).mapper).to.be.equal('UNROM');
    expect(testNES2({mapperId: 3}).mapper).to.be.equal('CNROM');
    expect(testNES2({mapperId: 4}).mapper).to.be.equal('MMC3');
    expect(testNES2({mapperId: 7}).mapper).to.be.equal('AOROM');
    expect(testNES2({mapperId: 11}).mapper).to.be.equal('ColorDreams');
    expect(testNES2({mapperId: 34, chrROMUnits: 0}).mapper).to.be.equal('BNROM');
    expect(testNES2({mapperId: 34, chrROMUnits: 1}).mapper).to.be.equal('NINA-001');
  });

  it('shoud read submapper ID', () => {
    expect(testNES2({submapperId: 0x0A}).submapperId).to.be.equal(0xA);
  });

  it('should detect correct submapper', () => {
    expect(testNES2({mapperId: 1, submapperId: 1}).submapper).to.be.equal('SUROM');
    expect(testNES2({mapperId: 1, submapperId: 2}).submapper).to.be.equal('SOROM');
    expect(testNES2({mapperId: 1, submapperId: 3}).submapper).to.be.equal('SXROM');
  });
});

function testNES2(params) {
  return readNES2(makeNES2(params));
}

function readNES2(data) {
  const loader = new NES2Loader;
  const reader = new Uint8ArrayReader(data);
  if (!loader.supports(reader)) {
    return null;
  }
  return loader.load(reader);
}

function makeNES2({
                    prgROMUnits = 1,
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
                    submapperId = 0,
                  }) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgROMUnits & 0xFF,
    chrROMUnits & 0xFF,
    (mapperId << 4) & 0xF0 | fourScreenMode << 3 | hasTrainer << 2 | hasPRGRAMBattery << 1 | verticalMirroring << 0,
    mapperId & 0xF0 | 0x08,
    (submapperId << 4) & 0xF0 | (mapperId >>> 8) & 0x0F,
    (chrROMUnits >>> 4) & 0xF0 | (prgROMUnits >>> 8) & 0x0F,
    (prgRAMUnitsBattery << 4) & 0xFF | prgRAMUnits & 0x0F,
    (chrRAMUnitsBattery << 4) & 0xFF | chrRAMUnits & 0x0F,
    palRegion & 0x01,
    0, 0, 0,
  ];

  const trainer = makeArray(hasTrainer ? 512 : 0, 1);
  const prgROM = makeArray(prgROMUnits * 0x4000, 2);
  const chrROM = makeArray(chrROMUnits * 0x2000, 3);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}
