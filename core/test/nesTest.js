import {expect} from 'chai';
import {NES, Region, Joypad, readCartridge} from '../src';

describe('NES (no cartridge)', () => {
  let nes, cartridge, joypad, frameBuffer, palette;

  const regions = [null, Region.PAL, Region.NTSC];
  const channels = [0, 1, 2, 3, 4];
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

  it('has region auto-detection set by default', () => {
    expect(nes.getRegion()).to.be.null;
  });

  for (const region of regions) {
    it('changes region to ' + (region || 'auto-detection'), () => {
      nes.setRegion(region);
      expect(nes.getRegion()).to.equal(region);
    });
  }

  for (const region of regions) {
    const usedRegion = region || Region.NTSC;
    it(`uses ${usedRegion} region ` + (region ? `when ${region} is set` : 'when auto-detection is enabled'), () => {
      nes.setRegion(region);
      expect(nes.getUsedRegion()).to.equal(usedRegion);
    });
  }

  it('has no cartridge by default', () => {
    expect(nes.getCartridge()).to.be.null;
  });

  it('inserts cartridge', () => {
    nes.setCartridge(cartridge);
    expect(nes.getCartridge()).to.equal(cartridge);
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
      expect(nes.getInputDevice(port)).to.equal(joypad);
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
    expect(nes.getPalette()).to.equal(palette);
  });

  it('renders empty frame', () => {
    nes.renderFrame(frameBuffer);
  });

  it('renders empty debug frame', () => {
    nes.renderDebugFrame(frameBuffer);
  });

  it('has zero audio sampling rate by default', () => {
    expect(nes.getAudioSampleRate()).to.equal(0);
  });

  it('changes audio sampling rate', () => {
    nes.setAudioSampleRate(44100);
    expect(nes.getAudioSampleRate()).to.equal(44100);
  });

  it('has no audio callback by default', () => {
    expect(nes.getAudioCallback()).to.be.null;
  });

  it('changes audio callback', () => {
    function callback() {}
    nes.setAudioCallback(callback);
    expect(nes.getAudioCallback()).to.equal(callback);
    nes.setAudioCallback(null);
    expect(nes.getAudioCallback()).to.be.null;
  });

  it('does not call audio callback during frame generation', () => {
    let callbackCounter = 0;
    nes.setAudioSampleRate(44100);
    nes.setAudioCallback(() => { callbackCounter++; });
    nes.renderFrame(frameBuffer);
    expect(callbackCounter).to.equal(0);
  });

  for (const channel of channels) {
    it(`has 100% audio channel #${channel} volume by default`, () => {
      expect(nes.getAudioVolume(channel)).to.equal(1);
    });
  }

  for (const channel of channels) {
    it(`changes audio channel #${channel} volume`, () => {
      nes.setAudioVolume(channel, 0.5);
      expect(nes.getAudioVolume(channel)).to.equal(0.5);
    });
  }

  it('returns null NVRAM', () => {
    expect(nes.getNVRAM()).to.be.null;
  });
});

describe('NES (cartridge set, no NVRAM)', () => {
  let nes, cartridge, frameBuffer, palette;

  before(() => {
    cartridge = readCartridge('./test/roms/nestest/nestest.nes');
    cartridge.region = Region.PAL;
    frameBuffer = new Uint32Array(256 * 240);
    palette = new Uint32Array(64);
  });

  beforeEach(() => {
    nes = new NES;
    nes.setCartridge(cartridge);
  });

  it('uses region from cartridge when auto-detection is enabled', () => {
    nes.setRegion(null);
    expect(nes.getUsedRegion()).to.equal(Region.PAL);
  });

  it('uses specific region when it is manually set', () => {
    nes.setRegion(Region.NTSC);
    expect(nes.getUsedRegion()).to.equal(Region.NTSC);
  });

  it('has cartridge', () => {
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

  it('calls audio callback during frame generation', () => {
    let callbackCounter = 0;
    nes.setAudioSampleRate(44100);
    nes.setAudioCallback(sample => {
      expect(sample).to.be.at.least(0);
      callbackCounter++;
    });
    nes.setPalette(palette);
    nes.renderFrame(frameBuffer);
    expect(callbackCounter).to.be.at.least(500);
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
    expect(nes.getNVRAM()).to.be.an('Uint8Array').with.lengthOf(0x2000);
  });

  it('returns the same NVRAM instance every time', () => {
    expect(nes.getNVRAM()).to.equal(nes.getNVRAM());
  });
});
