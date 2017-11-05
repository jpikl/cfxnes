import {hasAudioContext} from '../src/audio';
import {dispatchMouseEvent} from './input/utils';

export default function test(name, cfxnes) {
  describe(name, () => {
    let canInit;

    after(() => {
      return cfxnes.close();
    });

    it('has version in valid format', () => {
      expect(cfxnes.version).to.be.a('string')
        .that.matches(/^[0-9]+\.[0-9]+\.[0-9]+$/);
    });

    it('has "warn" log level by default', () => {
      expect(cfxnes.logLevel).to.equal('warn');
    });

    it('changes log level', () => {
      cfxnes.logLevel = 'error';
      expect(cfxnes.logLevel).to.equal('error');
    });

    it('creates instance when called with no arguments', () => {
      canInit = false;
      expect(cfxnes()).to.be.an('object');
      canInit = true;
    });

    it('creates instance when called with empty object as argument', () => {
      canInit = false;
      expect(cfxnes({})).to.be.an('object');
      canInit = true;
    });

    it('throws error when called with invalid argument', () => {
      expect(() => cfxnes('x')).to.throw('Invalid initialization options: "x"');
    });

    function checkCanInit() {
      if (!canInit) {
        this.skip();
      }
    }

    describe('core', () => {
      let nes;

      before(checkCanInit);

      beforeEach(() => {
        nes = cfxnes();
      });

      it('is stopped by default', () => {
        expect(nes.running).to.be.false;
      });

      it('starts/stops execution', () => {
        nes.start();
        expect(nes.running).to.be.true;
        nes.stop();
        expect(nes.running).to.be.false;
      });

      it('does one step of execution', () => {
        nes.step();
      });

      it('provides FPS', () => {
        expect(nes.fps).to.be.a('number');
      });

      it('does HW reset', () => {
        nes.power();
      });

      it('does SW reset', () => {
        nes.reset();
      });

      it('changes region', () => {
        nes.region = 'ntsc';
        expect(nes.region).to.equal('ntsc');
      });

      it('changes speed', () => {
        nes.speed = 2;
        expect(nes.speed).to.equal(2);
      });

      it('uses default parameters', () => {
        expect(nes.region).to.equal('auto');
        expect(nes.speed).to.equal(1);
      });

      it('uses provided parameters', () => {
        nes = cfxnes({
          region: 'pal',
          speed: 2,
        });
        expect(nes.region).to.equal('pal');
        expect(nes.speed).to.equal(2);
      });
    });

    describe('rom', () => {
      let JSZip;

      before(function() {
        if (!canInit) {
          this.skip();
        } else {
          ({JSZip} = window);
        }
      });

      after(() => {
        window.JSZip = JSZip;
      });

      it('is not loaded by default', () => {
        const {rom} = cfxnes();
        expect(rom.loaded).to.be.false;
      });

      it('loads/unloads', () => {
        const {rom} = cfxnes();
        return rom.load('data/nestest.nes').then(() => {
          expect(rom.loaded).to.be.true;
          rom.unload();
          expect(rom.loaded).to.be.false;
        });
      });

      it('throws error when loading from ZIP', () => {
        window.JSZip = undefined;
        const {rom} = cfxnes();
        return expect(rom.load('data/nestest.zip'))
          .to.eventually.be.rejectedWith('Unable to extract ROM image: JSZip 3 is not available');
      });

      it('loads ZIP when JSZip is provided through parameter', () => {
        window.JSZip = undefined;
        const {rom} = cfxnes({JSZip});
        return rom.load('data/nestest.zip')
          .then(() => expect(rom.loaded).to.be.true);
      });

      it('loads ZIP when JSZip is provided through global variable', () => {
        window.JSZip = JSZip;
        const {rom} = cfxnes();
        return rom.load('data/nestest.zip')
          .then(() => expect(rom.loaded).to.be.true);
      });

      it('loads from provided parameter and starts execution', done => {
        const nes = cfxnes({rom: 'data/nestest.nes'});
        const {rom} = nes;
        let maxTries = 20;
        function checkLoaded() {
          if (rom.loaded) {
            if (nes.running) {
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

      it('provides null SHA-1 when not loaded', () => {
        const {rom} = cfxnes();
        expect(rom.sha1).to.be.null;
      });

      it('provides SHA-1 when loaded', () => {
        const {rom} = cfxnes();
        return rom.load('data/nestest.nes')
          .then(() => expect(rom.sha1).to.equal('4131307f0f69f2a5c54b7d438328c5b2a5ed0820'));
      });
    });

    describe('nvram', () => {
      let nes;

      before(checkCanInit);

      beforeEach(() => {
        nes = cfxnes();
      });

      it('has null data when not present', () => {
        expect(nes.nvram).to.be.null;
      });

      it('has data when present', () => {
        const {rom} = nes;
        return rom.load('data/M1_P128K_C128K_S8K.nes').then(() => {
          expect(nes.nvram).to.be.an('Uint8Array').with.lengthOf(0x2000);
        });
      });
    });

    describe('video', () => {
      let video;

      before(checkCanInit);

      beforeEach(() => {
        ({video} = cfxnes());
      });

      it('changes output', () => {
        const canvas = document.createElement('canvas');
        video.output = canvas;
        expect(video.output).to.equal(canvas);
      });

      it('changes renderer', () => {
        video.renderer = 'canvas';
        expect(video.renderer).to.equal('canvas');
      });

      it('changes palette', () => {
        video.palette = 'nestopia-rgb';
        expect(video.palette).to.equal('nestopia-rgb');
      });

      it('changes scale', () => {
        video.scale = 2;
        expect(video.scale).to.equal(2);
      });

      it('changes filter', () => {
        video.filter = 'linear';
        expect(video.filter).to.equal('linear');
      });

      it('changes debug', () => {
        video.debug = true;
        expect(video.debug).to.be.true;
      });

      it('clears output', () => {
        video.output = document.createElement('canvas');
        video.clear();
      });

      it('uses default parameters', () => {
        expect(video.output).to.be.null;
        expect(video.renderer).to.equal('webgl');
        expect(video.scale).to.equal(1);
        expect(video.filter).to.equal('nearest');
        expect(video.debug).to.be.false;
      });

      it('uses provided parameters', () => {
        const canvas = document.createElement('canvas');
        const nes = cfxnes({
          video: {
            output: canvas,
            renderer: 'canvas',
            scale: 2,
            filter: 'linear',
            debug: true,
          },
        });
        ({video} = nes);
        expect(video.output).to.equal(canvas);
        expect(video.renderer).to.equal('canvas');
        expect(video.scale).to.equal(2);
        expect(video.filter).to.equal('linear');
        expect(video.debug).to.be.true;
      });

      it('uses canvas with "cfxnes" ID automatically as output', () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'cfxnes';
        document.body.appendChild(canvas);
        try {
          expect(cfxnes().video.output).to.equal(canvas);
        } finally {
          document.body.removeChild(canvas);
        }
      });
    });

    describe('fullscreen', () => {
      let fullscreen;

      before(checkCanInit);

      beforeEach(() => {
        ({fullscreen} = cfxnes());
      });

      it('throws error when entering with no output set', () => {
        expect(() => fullscreen.enter()).to.throw('No video output');
      });

      it('exists with not error', () => {
        return fullscreen.exit();
      });

      it('changes its type', () => {
        fullscreen.type = 'stretched';
        expect(fullscreen.type).to.equal('stretched');
      });

      it('uses default parameters', () => {
        expect(fullscreen.type).to.equal('maximized');
      });

      it('uses provided parameters', () => {
        const nes = cfxnes({
          fullscreen: {
            type: 'stretched',
          },
        });
        ({fullscreen} = nes);
        expect(fullscreen.type).to.equal('stretched');
      });
    });

    describe('audio', () => {
      let audio;

      before(function() {
        if (!canInit || !hasAudioContext()) {
          this.skip();
        }
      });

      beforeEach(() => {
        ({audio} = cfxnes());
      });

      it('changes enablement', () => {
        audio.enabled = false;
        expect(audio.enabled).to.be.false;
      });

      for (const channel of ['master', 'pulse1', 'pulse2', 'triangle', 'noise', 'dmc']) {
        it(`changes volume of ${channel} channel`, () => {
          audio.volume[channel] = 0.25;
          expect(audio.volume[channel]).to.equal(0.25);
        });
      }

      it('uses default parameters', () => {
        expect(audio.enabled).to.be.true;
        expect(audio.volume.master).to.equal(0.5);
        expect(audio.volume.pulse1).to.equal(1);
        expect(audio.volume.pulse2).to.equal(1);
        expect(audio.volume.triangle).to.equal(1);
        expect(audio.volume.noise).to.equal(1);
        expect(audio.volume.dmc).to.equal(1);
      });

      it('uses provided parameters', () => {
        const nes = cfxnes({
          audio: {
            enabled: false,
            volume: {
              master: 0.1,
              pulse1: 0.2,
              pulse2: 0.3,
              triangle: 0.4,
              noise: 0.5,
              dmc: 0.6,
            },
          },
        });
        ({audio} = nes);
        expect(audio.enabled).to.be.false;
        expect(audio.volume.master).to.equal(0.1);
        expect(audio.volume.pulse1).to.equal(0.2);
        expect(audio.volume.pulse2).to.equal(0.3);
        expect(audio.volume.triangle).to.equal(0.4);
        expect(audio.volume.noise).to.equal(0.5);
        expect(audio.volume.dmc).to.equal(0.6);
      });
    });

    describe('devices', () => {
      let devices;

      before(checkCanInit);

      beforeEach(() => {
        ({devices} = cfxnes());
      });

      it('changes input device', () => {
        devices[1] = null;
        devices[2] = 'joypad';
        expect(devices[1]).to.be.null;
        expect(devices[2]).to.equal('joypad');
      });

      it('uses default parameters', () => {
        expect(devices[1]).to.equal('joypad');
        expect(devices[2]).to.equal('zapper');
      });

      it('uses provided parameters', () => {
        const nes = cfxnes({
          devices: {
            1: null,
            2: 'joypad',
          },
        });
        ({devices} = nes);
        expect(devices[1]).to.be.null;
        expect(devices[2]).to.equal('joypad');
      });
    });

    describe('inputs', () => {
      let inputs;

      before(checkCanInit);

      beforeEach(() => {
        ({inputs} = cfxnes());
      });

      it('changes state', () => {
        inputs.state.set('1.joypad.a', true);
        expect(inputs.state.get('1.joypad.a')).to.be.true;
        inputs.state.set('1.joypad.a', false);
        expect(inputs.state.get('1.joypad.a')).to.be.false;
        inputs.state.set('2.zapper.beam', [1, 2]);
        expect(inputs.state.get('2.zapper.beam')).to.deep.equal([1, 2]);
      });

      it('changes mapping', () => {
        inputs.map.delete('1.joypad.a');
        expect(inputs.map.get('1.joypad.a')).to.deep.equal([]);
        inputs.map.set('1.joypad.a', 'keyboard.x');
        inputs.map.set('1.joypad.a', 'keyboard.y');
        expect(inputs.map.get('1.joypad.a')).to.deep.equal(['keyboard.x', 'keyboard.y']);
        inputs.map.delete('keyboard.x');
        expect(inputs.map.get('1.joypad.a')).to.deep.equal(['keyboard.y']);
      });

      it('records inputs', () => {
        let event;
        inputs.record(e => { event = e; });
        dispatchMouseEvent('mouseup', {button: 0});
        expect(event).to.equal('mouse.left');
      });

      it('uses default parameters', () => {
        expect(inputs.map.get('1.joypad.b')).to.deep.equal(['keyboard.y', 'keyboard.z']);
      });

      it('uses provided parameters', () => {
        const nes = cfxnes({
          inputs: {'1.joypad.b': 'keyboard.a'},
        });
        ({inputs} = nes);
        expect(inputs.map.get('1.joypad.b')).to.deep.equal(['keyboard.a']);
      });
    });

    describe('config', () => {
      let nes, config;

      before(checkCanInit);

      beforeEach(() => {
        nes = cfxnes();
        ({config} = nes);
      });

      it('returns all options and their values', () => {
        expect(config.get().region).to.equal('auto');
      });

      it('applies values of specified options', () => {
        config.use({region: 'ntsc'});
        expect(nes.region).to.equal('ntsc');
      });

      it('ignores undefined values of options', () => {
        config.use({region: undefined});
        expect(nes.region).to.equal('auto');
      });
    });
  });
}
