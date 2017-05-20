import {expect} from 'chai';
import NES from '../src/NES';
import {Region} from '../src/common';
import {Channel} from '../src/audio';
import {Joypad} from '../src/devices';
import {readCartridge} from '../src/cartridge';

describe('NES (no cartridge)', () => {
  let nes, cartridge, joypad, frameBuffer, palette;

  const regions = [null, Region.PAL, Region.NTSC];
  const channels = [Channel.PULSE_1, Channel.PULSE_2, Channel.TRIANGLE, Channel.NOISE, Channel.DMC];
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
    it('changes region to ' + (region || 'autodetection'), () => {
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

  it('inserts cartridge', () => {
    nes.setCartridge(cartridge);
    expect(nes.getCartridge()).to.be.equal(cartridge);
  });

  it('does HW reset', () => {
    nes.power();
  });

  it('does SW reset', () => {
    nes.reset();
  });

  for (const port of ports) {
    it(`has no device set on port #${port} by default`, () => {
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  for (const port of ports) {
    it(`sets device on port #${port}`, () => {
      nes.setInputDevice(port, joypad);
      expect(nes.getInputDevice(port)).to.be.equal(joypad);
    });
  }

  for (const port of ports) {
    it(`removes device on port #${port}`, () => {
      nes.setInputDevice(port, joypad);
      nes.setInputDevice(port, null);
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  it('has no palette set by default', () => {
    expect(nes.getPalette()).to.be.null;
  });

  it('changes palette', () => {
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

  it('changes audio buffer size', () => {
    nes.setAudioBufferSize(4096);
    expect(nes.getAudioBufferSize()).to.be.equal(4096);
  });

  it('has undefined audio sampling rate by default', () => {
    expect(nes.getAudioSampleRate()).to.be.undefined;
  });

  it('changes audio sampling rate', () => {
    nes.setAudioSampleRate(44100);
    expect(nes.getAudioSampleRate()).to.be.equal(44100);
  });

  for (const channel of channels) {
    it(`has 100% audio channel #${channel} volume by default`, () => {
      expect(nes.getAudioVolume(channel)).to.be.equal(1);
    });
  }

  for (const channel of channels) {
    it(`changes audio channel #${channel} volume`, () => {
      nes.setAudioVolume(channel, 0.5);
      expect(nes.getAudioVolume(channel)).to.be.equal(0.5);
    });
  }

  it('reads empty audio buffer', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    expect(nes.readAudioBuffer()).to.be.deep.equal(new Float32Array(4096));
  });

  it('returns null NVRAM', () => {
    expect(nes.getNVRAM()).to.be.null;
  });
});

describe('NES (cartridge set, no NVRAM)', () => {
  let nes, cartridge, frameBuffer, palette, generateAudioOutput;

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    cartridge.region = Region.PAL;
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

  it('removes cartridge', () => {
    nes.setCartridge(null);
    expect(nes.getCartridge()).to.be.null;
  });

  it('does HW reset', () => {
    nes.power();
  });

  it('does SW reset', () => {
    nes.reset();
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
    nes.apu.getOutput = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('fills audio buffer with generated values when audio is enabled', () => {
    nes.setAudioBufferSize(4096);
    nes.setAudioSampleRate(44100);
    nes.setAudioEnabled(true);
    nes.apu.getOutput = generateAudioOutput;
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(nes.readAudioBuffer()).to.not.deep.equal(new Float32Array(4096).fill(0.5));
  });

  it('returns null NVRAM', () => {
    expect(nes.getNVRAM()).to.be.null;
  });
});

describe('NES (cartridge set, has NVRAM)', () => {
  let nes, cartridge;

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    cartridge.prgRAMSize = 0x4000;
    cartridge.prgRAMSizeBattery = 0x2000;
  });

  beforeEach(() => {
    nes = new NES;
    nes.setCartridge(cartridge);
  });

  it('returns NVRAM of correct type and size', () => {
    expect(nes.getNVRAM()).to.be.an('uint8array');
    expect(nes.getNVRAM()).to.have.lengthOf(0x2000);
  });

  it('returns the same NVRAM instance every time', () => {
    expect(nes.getNVRAM()).to.be.equal(nes.getNVRAM());
  });
});
