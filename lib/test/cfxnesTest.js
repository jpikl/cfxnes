/* eslint-env mocha */
/* eslint-disable no-unused-expressions, no-invalid-this */
/* global expect, CFxNES */

describe('CFxNES', () => {
  let cfxnes, JSZip, canInitialize;

  before(() => {
    JSZip = window.JSZip;
    window.JSZip = undefined;
  });

  afterEach(() => {
    window.JSZip = undefined;
  });

  after(() => {
    window.JSZip = JSZip;
    return CFxNES.close();
  });

  it('has version', () => {
    expect(CFxNES.version).to.be.a('string');
  });

  it('has "warn" log level by default', () => {
    expect(CFxNES.getLogLevel()).to.be.equal('warn');
  });

  it('sets/gets log level', () => {
    CFxNES.setLogLevel('off');
    expect(CFxNES.getLogLevel()).to.be.equal('off');
  });

  it('initializes without error', () => {
    canInitialize = false;
    expect(new CFxNES).to.be.instanceof(CFxNES);
    canInitialize = true;
  });

  function initBeforeEach() {
    beforeEach(function() {
      if (canInitialize !== false) {
        cfxnes = new CFxNES;
      } else {
        this.skip();
      }
    });
  }

  describe('System API', () => {
    initBeforeEach();

    it('starts/stops execution', () => {
      expect(cfxnes.isRunning()).to.be.false;
      cfxnes.start();
      expect(cfxnes.isRunning()).to.be.true;
      cfxnes.stop();
      expect(cfxnes.isRunning()).to.be.false;
    });

    it('does one step of execution', () => {
      cfxnes.step();
    });

    it('does HW reset', () => {
      cfxnes.power();
    });

    it('does SW reset', () => {
      cfxnes.reset();
    });

    it('sets/gets region', () => {
      cfxnes.setRegion('ntsc');
      expect(cfxnes.getRegion()).to.be.equal('ntsc');
    });

    it('sets/gets speed', () => {
      cfxnes.setSpeed(2);
      expect(cfxnes.getSpeed()).to.be.equal(2);
    });

    it('gets FPS', () => {
      expect(cfxnes.getFPS()).to.be.a('number');
    });

    it('uses default constructor parameters', () => {
      expect(cfxnes.getRegion()).to.be.equal('auto');
      expect(cfxnes.getSpeed()).to.be.equal(1);
    });

    it('uses provided constructor parameters', () => {
      cfxnes = new CFxNES({
        region: 'pal',
        speed: 2,
      });
      expect(cfxnes.getRegion()).to.be.equal('pal');
      expect(cfxnes.getSpeed()).to.be.equal(2);
    });
  });

  describe('Data API', () => {
    initBeforeEach();

    it('loads/unloads ROM', () => {
      expect(cfxnes.isROMLoaded()).to.be.false;
      return cfxnes.loadROM('roms/nestest.nes').then(() => {
        expect(cfxnes.isROMLoaded()).to.be.true;
        cfxnes.unloadROM();
        expect(cfxnes.isROMLoaded()).to.be.false;
      });
    });

    it('throws error when trying to load zipped ROM', () => {
      return expect(cfxnes.loadROM('roms/nestest.zip'))
        .to.eventually.be.rejectedWith('Unable to extract ROM image: JSZip is not available');
    });

    it('loads zipped ROM when JSZip is provided through constructor', () => {
      cfxnes = new CFxNES({JSZip});
      return cfxnes.loadROM('roms/nestest.zip')
       .then(() => expect(cfxnes.isROMLoaded()).to.be.true);
    });

    it('loads zipped ROM when JSZip is provided through global variable', () => {
      window.JSZip = JSZip;
      cfxnes = new CFxNES;
      return cfxnes.loadROM('roms/nestest.zip')
       .then(() => expect(cfxnes.isROMLoaded()).to.be.true);
    });

    it('loads ROM from provided constructor parameter and then starts execution', done => {
      cfxnes = new CFxNES({romSource: 'roms/nestest.nes'});
      let maxTries = 20;
      function checkLoaded() {
        if (cfxnes.isROMLoaded()) {
          if (cfxnes.isRunning()) {
            done();
          } else {
            done(new Error('Emulator is suppose to be running after loading the ROM image'));
          }
        } else if (--maxTries > 0) {
          setTimeout(checkLoaded, 50);
        } else {
          done(new Error('ROM image was not downloaded after specified timeout'));
        }
      }
      checkLoaded();
    });

    it('gets NVRAM', () => {
      expect(cfxnes.getNVRAM()).to.be.null;
    });

    it('loads NVRAM', () => {
      return cfxnes.loadNVRAM();
    });

    it('saves NVRAM', () => {
      return cfxnes.saveNVRAM();
    });

    it('deletes NVRAMs', () => {
      return cfxnes.deleteNVRAMs();
    });

    it('gets options', () => {
      expect(cfxnes.getOptions()).to.be.an('object');
    });

    it('sets options', () => {
      cfxnes.setOptions({region: 'ntsc'});
      expect(cfxnes.getRegion()).to.be.equal('ntsc');
    });

    it('resets options', () => {
      cfxnes.setRegion('ntsc');
      cfxnes.resetOptions('region');
      expect(cfxnes.getRegion()).to.be.equal('auto');
    });

    it('load options', () => {
      cfxnes.loadOptions();
    });

    it('saves options', () => {
      cfxnes.saveOptions();
    });

    it('deletes options', () => {
      cfxnes.deleteOptions();
    });
  });

  describe('Video API', () => {
    initBeforeEach();

    it('sets/gets video output', () => {
      const canvas = document.createElement('canvas');
      cfxnes.setVideoOutput(canvas);
      expect(cfxnes.getVideoOutput()).to.be.equal(canvas);
    });

    it('sets/gets video renderer', () => {
      cfxnes.setVideoRenderer('canvas');
      expect(cfxnes.getVideoRenderer()).to.be.equal('canvas');
    });

    it('sets/gets video palette', () => {
      cfxnes.setVideoPalette('nestopia-rgb');
      expect(cfxnes.getVideoPalette()).to.be.equal('nestopia-rgb');
    });

    it('sets/gets video scale', () => {
      cfxnes.setVideoScale(2);
      expect(cfxnes.getVideoScale()).to.be.equal(2);
    });

    it('gets maximum video scale', () => {
      expect(cfxnes.getMaxVideoScale()).to.be.at.least(1);
    });

    it('sets/gets video smoothing', () => {
      cfxnes.setVideoSmoothing(true);
      expect(cfxnes.isVideoSmoothing()).to.be.true;
    });

    it('sets/gets video debug', () => {
      cfxnes.setVideoDebug(true);
      expect(cfxnes.isVideoDebug()).to.be.true;
    });

    it('throws error when entering fullscreen', () => {
      expect(() => cfxnes.enterFullscreen()).to.throw('No video output');
    });

    it('exists fullscrfeen', () => {
      return cfxnes.exitFullscreen();
    });

    it('sets/gets fullscreen type', () => {
      cfxnes.setFullscreenType('stretched');
      expect(cfxnes.getFullscreenType()).to.be.equal('stretched');
    });

    it('uses default constructor parameters', () => {
      expect(cfxnes.getVideoOutput()).to.be.null;
      expect(cfxnes.getVideoRenderer()).to.be.equal('webgl');
      expect(cfxnes.getVideoScale()).to.be.equal(1);
      expect(cfxnes.isVideoSmoothing()).to.be.false;
      expect(cfxnes.isVideoDebug()).to.be.false;
      expect(cfxnes.getFullscreenType()).to.be.equal('maximized');
    });

    it('uses provided constructor parameters', () => {
      const canvas = document.createElement('canvas');
      cfxnes = new CFxNES({
        videoOutput: canvas,
        videoRenderer: 'canvas',
        videoScale: 2,
        videoSmoothing: true,
        videoDebug: true,
        fullscreenType: 'stretched',
      });
      expect(cfxnes.getVideoOutput()).to.be.equal(canvas);
      expect(cfxnes.getVideoRenderer()).to.be.equal('canvas');
      expect(cfxnes.getVideoScale()).to.be.equal(2);
      expect(cfxnes.isVideoSmoothing()).to.be.true;
      expect(cfxnes.isVideoDebug()).to.be.true;
      expect(cfxnes.getFullscreenType()).to.be.equal('stretched');
    });
  });

  describe('Audio API', () => {
    initBeforeEach();

    it('sets/gets audio enabled', () => {
      cfxnes.setAudioEnabled(false);
      expect(cfxnes.isAudioEnabled()).to.be.false;
    });

    it('sets/gets audio volume', () => {
      cfxnes.setAudioVolume('pulse1', 0.1);
      expect(cfxnes.getAudioVolume('pulse1')).to.be.equal(0.1);
    });

    it('uses default constructor parameters', () => {
      expect(cfxnes.isAudioEnabled()).to.be.true;
      expect(cfxnes.getAudioVolume()).to.be.equal(0.5);
      expect(cfxnes.getAudioVolume('pulse1')).to.be.equal(1);
      expect(cfxnes.getAudioVolume('pulse2')).to.be.equal(1);
    });

    it('uses provided constructor parameters', () => {
      cfxnes = new CFxNES({
        audioEnabled: false,
        audioVolume: {master: 0.1, pulse1: 0.2},
      });
      expect(cfxnes.isAudioEnabled()).to.be.false;
      expect(cfxnes.getAudioVolume()).to.be.equal(0.1);
      expect(cfxnes.getAudioVolume('pulse1')).to.be.equal(0.2);
      expect(cfxnes.getAudioVolume('pulse2')).to.be.equal(1);
    });
  });

  describe('Input API', () => {
    initBeforeEach();

    it('sets/gets input device', () => {
      cfxnes.setInputDevice(1, 'zapper');
      expect(cfxnes.getInputDevice(1)).to.be.equal('zapper');
    });

    it('maps/unmaps/gets inputs', () => {
      cfxnes.unmapInputs();
      expect(cfxnes.getMappedInputs('1.joypad.a')).to.deep.equal([]);
      cfxnes.mapInputs('1.joypad.a', ['keyboard.x', 'keyboard.y']);
      expect(cfxnes.getMappedInputs('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
      cfxnes.unmapInputs('keyboard.x');
      expect(cfxnes.getMappedInputs('1.joypad.a')).to.deep.equal(['keyboard.y']);
      cfxnes.unmapInputs();
      expect(cfxnes.getMappedInputs('1.joypad.a')).to.deep.equal([]);
    });

    it('records inputs', () => {
      let event;
      cfxnes.recordInput(e => { event = e; });
      dispatchEvent(new MouseEvent('mouseup', {button: 0}));
      expect(event).to.equal('mouse.left');
    });

    it('uses default constructor parameters', () => {
      expect(cfxnes.getMappedInputs('1.joypad.b')).to.deep.equal(['keyboard.y', 'keyboard.z']);
    });

    it('uses provided constructor parameters', () => {
      cfxnes = new CFxNES({
        inputDevices: ['zapper'],
        inputMapping: {'1.joypad.b': ['keyboard.a']},
      });
      expect(cfxnes.getInputDevice(1)).to.be.equal('zapper');
      expect(cfxnes.getInputDevice(2)).to.be.null;
      expect(cfxnes.getMappedInputs('1.joypad.b')).to.deep.equal(['keyboard.a']);
    });
  });
});
