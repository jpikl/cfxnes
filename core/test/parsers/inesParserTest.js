/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import {Mirroring, Region} from '../../src/enums';
import inesParser from '../../src/parsers/inesParser';

const expect = chai.expect;
const parseROM = inesParser.parse;

describe('inesParser (iNES input)', () => {
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
    expect(testROM({prgROMUnits: 0xFF}).prgROMSize).to.be.equal(0x3FC000);
  });

  it('should read PRG ROM', () => {
    expect(testROM({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(0x4000).fill(1));
    expect(testROM({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(0x8000).fill(1));
  });

  it('should read PRG RAM size', () => {
    expect(testROM({prgRAMUnits: 0}).prgRAMSize).to.be.equal(0x2000);
    expect(testROM({prgRAMUnits: 1}).prgRAMSize).to.be.equal(0x2000);
    expect(testROM({prgRAMUnits: 2}).prgRAMSize).to.be.equal(0x4000);
    expect(testROM({prgRAMUnits: 0xFF}).prgRAMSize).to.be.equal(0x1FE000);
  });

  it('should read battery-backed PRG RAM size as 0', () => {
    expect(testROM().prgRAMSizeBattery).to.be.equal(0);
  });

  it('should read CHR ROM size', () => {
    expect(testROM({chrROMUnits: 0}).chrROMSize).to.be.equal(0);
    expect(testROM({chrROMUnits: 1}).chrROMSize).to.be.equal(0x2000);
    expect(testROM({chrROMUnits: 2}).chrROMSize).to.be.equal(0x4000);
    expect(testROM({chrROMUnits: 0xFF}).chrROMSize).to.be.equal(0x1FE000);
  });

  it('should read CHR ROM', () => {
    expect(testROM({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(testROM({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(0x2000).fill(2));
    expect(testROM({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(0x4000).fill(2));
  });

  it('should read CHR RAM size', () => {
    expect(testROM({chrROMUnits: 0}).chrRAMSize).to.be.equal(0x2000);
    expect(testROM({chrROMUnits: 1}).chrRAMSize).to.be.equal(0);
  });

  it('should read battery-backed CHR RAM size as 0', () => {
    expect(testROM().chrRAMSizeBattery).to.be.equal(0);
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
    expect(testROM({mapperId: 0xFE}).mapper).to.be.equal(String(0xFE));
  });

  it('should not read subbmapper', () => {
    expect(testROM().submapper).to.be.undefined;
  });
});

function testROM(params = {}) {
  return parseROM(createROM(params));
}

function createROM({prgROMUnits = 1,
                    prgRAMUnits = 0,
                    chrROMUnits = 1,
                    hasPRGRAMBattery = false,
                    hasTrainer = false,
                    verticalMirroring = false,
                    fourScreenMode = false,
                    palRegion = false,
                    mapperId = 0}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgROMUnits & 0xFF,
    chrROMUnits & 0xFF,
    (mapperId << 4) & 0xF0 | fourScreenMode << 3 | hasTrainer << 2 | hasPRGRAMBattery << 1 | verticalMirroring << 0,
    mapperId & 0xF0,
    prgRAMUnits & 0xFF,
    palRegion & 0x01,
    0, 0, 0, 0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgROM = new Uint8Array(prgROMUnits * 0x4000).fill(1);
  const chrROM = new Uint8Array(chrROMUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}
