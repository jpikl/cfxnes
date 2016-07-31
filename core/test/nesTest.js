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

  const regions = [null, Region.PAL, Region.NTSC];
  const channelIds = [APU.PULSE_1, APU.PULSE_2, APU.TRIANGLE, APU.NOISE, APU.DMC];
  const ports = [1, 2];

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    joypad = new Joypad;
    frameBuffer = new Uint32Array(256 * 240);
    palette = new Uint32Array(64);
  });

  beforeEach(() => {
    nes = new NES;
  });

  it('has region autodetection set by default', () => {
    expect(nes.getRegion()).to.be.null;
  });

  for (const region of regions) {
    it('sets/gets ' + (region ? `${region} region` : 'region autodetection'), () => {
      nes.setRegion(region);
      expect(nes.getRegion()).to.equal(region);
    });
  }

  for (const region of regions) {
    const usedRegion = region || Region.NTSC;
    it(`uses ${usedRegion} region ` + (region ? `when ${region} is set` : 'when autodetection is enabled'), () => {
      nes.setRegion(region);
      expect(nes.getUsedRegion()).to.equal(usedRegion);
    });
  }

  it('has no cartridge by default', () => {
    expect(nes.getCartridge()).to.be.null;
  });

  it('sets/gets cartridge', () => {
    nes.setCartridge(cartridge);
    expect(nes.getCartridge()).to.be.equal(cartridge);
  });

  it('does HW reset', () => {
    nes.hardReset();
  });

  it('does SW reset', () => {
    nes.softReset();
  });

  for (const port of ports) {
    it(`has no device set on port #${port} by default`, () => {
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  for (const port of ports) {
    it(`sets/gets device on port #${port}`, () => {
      nes.setInputDevice(port, joypad);
      expect(nes.getInputDevice(port)).to.be.equal(joypad);
    });
  }

  for (const port of ports) {
    it(`sets/gets no device on port #${port}`, () => {
      nes.setInputDevice(port, joypad);
      nes.setInputDevice(port, null);
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  it('has no palette set by default', () => {
    expect(nes.getPalette()).to.be.null;
  });

  it('sets/gets palette', () => {
    nes.setPalette(palette);
    expect(nes.getPalette()).to.be.equal(palette);
  });

  it('renders empty frame', () => {
    nes.renderFrame(frameBuffer);
  });

  it('renders empty debug frame', () => {
    nes.renderDebugFrame(frameBuffer);
  });

  it('has audio disabled by default', () => {
    expect(nes.isAudioEnabled()).to.be.false;
  });

  it('enables/disables audio', () => {
    nes.setAudioEnabled(true);
    expect(nes.isAudioEnabled()).to.be.true;
    nes.setAudioEnabled(false);
    expect(nes.isAudioEnabled()).to.be.false;
  });

  it('has undefined audio buffer size by default', () => {
    expect(nes.getAudioBufferSize()).to.be.undefined;
  });

  it('sets/gets audio buffer size', () => {
    nes.setAudioBufferSize(4096);
    expect(nes.getAudioBufferSize()).to.be.equal(4096);
  });

  it('has undefined audio sampling rate by default', () => {
    expect(nes.getAudioSampleRate()).to.be.undefined;
  });

  it('sets/gets audio sampling rate', () => {
    nes.setAudioSampleRate(44100);
    expect(nes.getAudioSampleRate()).to.be.equal(44100);
  });

  for (const id of channelIds) {
    it(`has 100% audio channel #${id} volume by default`, () => {
      expect(nes.getAudioChannelVolume(id)).to.be.equal(1);
    });
  }

  for (const id of channelIds) {
    it(`sets/gets audio channel #${id} volume`, () => {
      nes.setAudioChannelVolume(id, 0.5);
      expect(nes.getAudioChannelVolume(id)).to.be.equal(0.5);
    });
  }

  it('reads empty audio buffer', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    expect(nes.readAudioBuffer()).to.be.deep.equal(new Float32Array(4096));
  });

  it('gets zero NVRAM size', () => {
    expect(nes.getNVRAMSize()).to.be.equal(0);
  });

  it('gets null NVRAM', () => {
    expect(nes.getNVRAM()).to.be.null;
  });

  it('sets NVRAM with no effect', () => {
    nes.setNVRAM([]);
  });
});

describe('NES (cartridge set)', () => {
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

  it('uses region from cartridge when autodetection is enabled', () => {
    nes.setRegion(null);
    expect(nes.getUsedRegion()).to.equal(Region.PAL);
  });

  it('uses specific region when it is manually set', () => {
    nes.setRegion(Region.NTSC);
    expect(nes.getUsedRegion()).to.equal(Region.NTSC);
  });

  it('has cartrdge', () => {
    expect(nes.getCartridge()).to.be.an('object');
  });

  it('sets/gets no cartridge', () => {
    nes.setCartridge(null);
    expect(nes.getCartridge()).to.be.null;
  });

  it('does HW reset', () => {
    nes.hardReset();
  });

  it('does SW reset', () => {
    nes.softReset();
  });

  it('renders frame', () => {
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
  });

  it('renders debug frame', () => {
    nes.setPalette(palette);
    nes.renderDebugFrame(frameBuffer);
  });

  it('fills audio buffer with constant value when audio is diabled', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    nes.setAudioEnabled(false);
    nes.apu.getOutputValue = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('fills audio buffer with generated values when audio is enabled', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    nes.setAudioEnabled(true);
    nes.apu.getOutputValue = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.not.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('gets NVRAM size', () => {
    expect(nes.getNVRAMSize()).to.be.equal(0x2000);
  });

  it('sets/gets NVRAM', () => {
    const nvram = new Uint8Array(0x2000).fill(0xFF);
    expect(nes.getNVRAM()).to.deep.equal(new Uint8Array(0x2000));
    nes.setNVRAM(nvram);
    expect(nes.getNVRAM()).to.be.not.equal(nvram);
    expect(nes.getNVRAM()).to.deep.equal(nvram);
  });
});
