/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import NES from '../src/NES';
import APU from '../src/audio/APU';
import Region from '../src/common/Region';
import Joypad from '../src/devices/Joypad';
import {readCartridge} from '../src/data/cartridge';

describe('NES (no cartridge)', () => {
  let nes, cartridge, joypad, frameBuffer, palette;

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    joypad = new Joypad;
    frameBuffer = new Uint32Array(256 * 240);
    palette = new Uint32Array(64);
  });

  beforeEach(() => {
    nes = new NES;
  });

  it('should allow to get/set region', () => {
    expect(nes.getRegion()).to.equal(Region.NTSC);
    nes.setRegion(Region.PAL);
    expect(nes.getRegion()).to.equal(Region.PAL);
    nes.setRegion(null);
    expect(nes.getRegion()).to.equal(Region.NTSC);
  });

  it('should allow to get/set cartridge', () => {
    expect(nes.getCartridge()).to.be.null;
    nes.setCartridge(cartridge);
    expect(nes.getCartridge()).to.be.equal(cartridge);
    nes.setCartridge(null);
    expect(nes.getCartridge()).to.be.null;
  });

  it('should allow HW reset', () => {
    nes.hardReset();
  });

  it('should allow SW reset', () => {
    nes.softReset();
  });

  for (const port of [1, 2]) {
    it(`should allow to get/set device on port #${port}`, () => {
      expect(nes.getInputDevice(port)).to.be.null;
      nes.setInputDevice(port, joypad);
      expect(nes.getInputDevice(port)).to.be.equal(joypad);
      nes.setInputDevice(port, null);
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  it('should allow to get/set palette', () => {
    expect(nes.getPalette()).to.be.null;
    nes.setPalette(palette);
    expect(nes.getPalette()).to.be.equal(palette);
  });

  it('should render empty frame', () => {
    nes.renderFrame(frameBuffer);
  });

  it('should render empty debug frame', () => {
    nes.renderDebugFrame(frameBuffer);
  });

  it('should allow to enable/disable audio', () => {
    expect(nes.isAudioEnabled()).to.be.false;
    nes.setAudioEnabled(true);
    expect(nes.isAudioEnabled()).to.be.true;
  });

  it('should allow to get/set audio buffer size', () => {
    expect(nes.getAudioBufferSize()).to.be.undefined;
    nes.setAudioBufferSize(4096);
    expect(nes.getAudioBufferSize()).to.be.equal(4096);
  });

  it('should allow to get/set audio sampling rate', () => {
    expect(nes.getAudioSampleRate()).to.be.undefined;
    nes.setAudioSampleRate(44100);
    expect(nes.getAudioSampleRate()).to.be.equal(44100);
  });

  for (const id of [APU.PULSE_1, APU.PULSE_2, APU.TRIANGLE, APU.NOISE, APU.DMC]) {
    it(`should allow to get/set volume of audio channel #${id}`, () => {
      expect(nes.getAudioChannelVolume(id)).to.be.equal(1);
      nes.setAudioChannelVolume(id, 0.5);
      expect(nes.getAudioChannelVolume(id)).to.be.equal(0.5);
    });
  }

  it('should allow to read empty audio buffer', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    expect(nes.readAudioBuffer()).to.be.deep.equal(new Float32Array(4096));
  });

  it('should return zero NVRAM size', () => {
    expect(nes.getNVRAMSize()).to.be.equal(0);
  });

  it('should return null NVRAM', () => {
    expect(nes.getNVRAM()).to.be.null;
  });

  it('should allow to set NVRAM with no effect', () => {
    nes.setNVRAM([]);
  });
});

describe('NES (cartridge inserted)', () => {
  let nes, cartridge, frameBuffer, palette, generateAudioOutput;

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    cartridge.region = Region.PAL;
    cartridge.prgRAMSize = 0x4000;
    cartridge.prgRAMSizeBattery = 0x2000;
    frameBuffer = new Uint32Array(256 * 240);
    palette = new Uint32Array(64);
    let audioOutput = 0.5;
    generateAudioOutput = () => {
      const value = audioOutput;
      audioOutput = -audioOutput;
      return value;
    };
  });

  beforeEach(() => {
    nes = new NES;
    nes.setCartridge(cartridge);
  });

  it('should use region from cartridge', () => {
    expect(nes.getRegion()).to.equal(Region.PAL);
    nes.setCartridge(null);
    expect(nes.getRegion()).to.equal(Region.NTSC);
  });

  it('should override default cartridge region', () => {
    nes.setRegion(Region.NTSC);
    expect(nes.getRegion()).to.equal(Region.NTSC);
  });

  it('should allow HW reset', () => {
    nes.hardReset();
  });

  it('should allow SW reset', () => {
    nes.softReset();
  });

  it('should render frame', () => {
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
  });

  it('should render debug frame', () => {
    nes.setPalette(palette);
    nes.renderDebugFrame(frameBuffer);
  });

  it('should fill audio buffer with constant value when audio is diabled', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    nes.setAudioEnabled(false);
    nes.apu.getOutputValue = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('should fill audio buffer with generated values when audio is enabled', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    nes.setAudioEnabled(true);
    nes.apu.getOutputValue = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.not.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('should return NVRAM size', () => {
    expect(nes.getNVRAMSize()).to.be.equal(0x2000);
  });

  it('should allow to get/set NVRAM', () => {
    const nvram = new Uint8Array(0x2000).fill(0xFF);
    expect(nes.getNVRAM()).to.deep.equal(new Uint8Array(0x2000));
    nes.setNVRAM(nvram);
    expect(nes.getNVRAM()).to.be.not.equal(nvram);
    expect(nes.getNVRAM()).to.deep.equal(nvram);
  });
});
