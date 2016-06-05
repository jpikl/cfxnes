/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import {makeArray} from '../../src/utils/array';
import INESLoader from '../../src/loaders/INESLoader';
import Uint8ArrayReader from '../../src/readers/Uint8ArrayReader';
import Mirroring from '../../src/common/Mirroring';
import Region from '../../src/common/Region';

const expect = chai.expect;

describe('iNES Loader', () => {
  it('should reject invalid image', () => {
    expect(readINES(new Uint8Array(100))).to.be.null;
  });

  it('should accept valid image', () => {
    expect(testINES({})).to.be.an('object');
  });

  it('should throw error for corrupted image', () => {
    expect(() => readINES(makeINES({}).subarray(0, 4))).to.throw(Error);
    expect(() => readINES(makeINES({}).subarray(0, 16))).to.throw(Error);
    expect(() => readINES(makeINES({}).subarray(0, 20))).to.throw(Error);
  });

  it('should detect trainer', () => {
    expect(testINES({hasTrainer: false}).hasTrainer).to.be.false;
    expect(testINES({hasTrainer: true}).hasTrainer).to.be.true;
  });

  it('should read trainer', () => {
    expect(testINES({hasTrainer: false}).trainer).to.be.undefined;
    expect(testINES({hasTrainer: true}).trainer).to.deep.equal(new Uint8Array(makeArray(512, 1)));
  });

  it('shoud read PRG ROM size', () => {
    expect(testINES({prgROMUnits: 1}).prgROMSize).to.be.equal(0x4000);
    expect(testINES({prgROMUnits: 2}).prgROMSize).to.be.equal(0x8000);
    expect(testINES({prgROMUnits: 0xFF}).prgROMSize).to.be.equal(0x3FC000);
  });

  it('shoud read PRG ROM', () => {
    expect(testINES({prgROMUnits: 1}).prgROM).to.deep.equal(new Uint8Array(makeArray(0x4000, 2)));
    expect(testINES({prgROMUnits: 2}).prgROM).to.deep.equal(new Uint8Array(makeArray(0x8000, 2)));
  });

  it('shoud detect PRG RAM', () => {
    expect(testINES({prgRAMUnits: 0}).hasPRGRAM).to.be.true; // Always true (iNES backward compatibility)
    expect(testINES({prgRAMUnits: 1}).hasPRGRAM).to.be.true;
  });

  it('shoud read PRG RAM size', () => {
    expect(testINES({prgRAMUnits: 0}).prgRAMSize).to.be.equal(0x2000);
    expect(testINES({prgRAMUnits: 1}).prgRAMSize).to.be.equal(0x2000);
    expect(testINES({prgRAMUnits: 2}).prgRAMSize).to.be.equal(0x4000);
    expect(testINES({prgRAMUnits: 0xFF}).prgRAMSize).to.be.equal(0x1FE000);
  });

  it('shoud detect CHR ROM', () => {
    expect(testINES({chrROMUnits: 0}).hasCHRROM).to.be.false;
    expect(testINES({chrROMUnits: 1}).hasCHRROM).to.be.true;
  });

  it('shoud read CHR ROM size', () => {
    expect(testINES({chrROMUnits: 0}).chrROMSize).to.be.equal(0);
    expect(testINES({chrROMUnits: 1}).chrROMSize).to.be.equal(0x2000);
    expect(testINES({chrROMUnits: 2}).chrROMSize).to.be.equal(0x4000);
    expect(testINES({chrROMUnits: 0xFF}).chrROMSize).to.be.equal(0x1FE000);
  });

  it('shoud read CHR ROM', () => {
    expect(testINES({chrROMUnits: 0}).chrROM).to.be.undefined;
    expect(testINES({chrROMUnits: 1}).chrROM).to.deep.equal(new Uint8Array(makeArray(0x2000, 3)));
    expect(testINES({chrROMUnits: 2}).chrROM).to.deep.equal(new Uint8Array(makeArray(0x4000, 3)));
  });

  it('shoud detect CHR RAM', () => {
    expect(testINES({chrROMUnits: 0}).hasCHRRAM).to.be.true;
    expect(testINES({chrROMUnits: 1}).hasCHRRAM).to.be.false;
  });

  it('shoud read CHR RAM size', () => {
    expect(testINES({chrROMUnits: 0}).chrRAMSize).to.be.equal(0x2000);
    expect(testINES({chrROMUnits: 1}).chrRAMSize).to.be.equal(0);
  });

  it('shoud read mirroring', () => {
    expect(testINES({fourScreenMode: false, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.HORIZONTAL);
    expect(testINES({fourScreenMode: false, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.VERTICAL);
    expect(testINES({fourScreenMode: true, verticalMirroring: false}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
    expect(testINES({fourScreenMode: true, verticalMirroring: true}).mirroring).to.be.equal(Mirroring.FOUR_SCREEN);
  });

  it('shoud read region', () => {
    expect(testINES({palRegion: false}).region).to.be.equal(Region.NTSC);
    expect(testINES({palRegion: true}).region).to.be.equal(Region.PAL);
  });

  it('shoud read mapper ID', () => {
    expect(testINES({mapperId: 0x81}).mapperId).to.be.equal(0x81);
  });

  it('should detect correct mapper', () => {
    expect(testINES({mapperId: 0}).mapper).to.be.equal('NROM');
    expect(testINES({mapperId: 1}).mapper).to.be.equal('MMC1');
    expect(testINES({mapperId: 2}).mapper).to.be.equal('UNROM');
    expect(testINES({mapperId: 3}).mapper).to.be.equal('CNROM');
    expect(testINES({mapperId: 4}).mapper).to.be.equal('MMC3');
    expect(testINES({mapperId: 7}).mapper).to.be.equal('AOROM');
    expect(testINES({mapperId: 11}).mapper).to.be.equal('ColorDreams');
    expect(testINES({mapperId: 34, chrROMUnits: 0}).mapper).to.be.equal('BNROM');
    expect(testINES({mapperId: 34, chrROMUnits: 1}).mapper).to.be.equal('NINA-001');
  });
});

function testINES(params) {
  return readINES(makeINES(params));
}

function readINES(data) {
  const loader = new INESLoader;
  const reader = new Uint8ArrayReader(data);
  if (!loader.supports(reader)) {
    return null;
  }
  return loader.load(reader);
}

function makeINES({
                    prgROMUnits = 1,
                    prgRAMUnits = 0,
                    chrROMUnits = 1,
                    hasPRGRAMBattery = false,
                    hasTrainer = false,
                    verticalMirroring = false,
                    fourScreenMode = false,
                    palRegion = false,
                    mapperId = 0,
                  }) {
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

  const trainer = makeArray(hasTrainer ? 512 : 0, 1);
  const prgROM = makeArray(prgROMUnits * 0x4000, 2);
  const chrROM = makeArray(chrROMUnits * 0x2000, 3);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}
