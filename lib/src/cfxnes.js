import {toString} from '../../core/src/common/utils';
import NES from '../../core/src/NES';
import log from '../../core/src/common/log';
import build from './props/builder';
import {readPropertyValues, writePropertyValues} from './props/values';
import Audio from './audio/Audio';
import ROM from './data/ROM';
import Sources from './input/Sources';
import Devices from './input/Devices';
import InputMap from './input/InputMap';
import InputRouter from './input/InputRouter';
import System from './system/System';
import Video from './video/Video';
import {ports} from './input/common';
import {channels} from './audio/Mixer';
import {hasAudioContext, closeAudioContext} from './audio/context';

const NAME = 'cfxnes';
const VERSION = '0.5.0';

const {defineProperties} = Object;

function cfxnes(initOptions = {}) {
  if (!initOptions || typeof initOptions !== 'object') {
    throw new Error('Invalid initialization options: ' + toString(initOptions));
  }

  const JSZip = initOptions['JSZip'] || window['JSZip'];
  const nes = new NES;
  const video = new Video(nes);
  const audio = hasAudioContext() ? new Audio(nes) : null;
  const devices = new Devices(nes);
  const inputMap = new InputMap;
  const inputRouter = new InputRouter(inputMap, devices, video);
  const sources = new Sources(inputRouter);
  const system = new System(nes, video, audio, sources);
  const rom = new ROM(nes, system, JSZip);

  const instance = defineProperties({}, {
    'running': build.computed(system.isRunning, system),
    'fps': build.computed(system.getFPS, system),
    'region': build.writable(system.getRegion, system.setRegion, system),
    'speed': build.writable(system.getSpeed, system.setSpeed, system),
    'start': build.method(system.start, system),
    'stop': build.method(system.stop, system),
    'step': build.method(system.step, system),
    'power': build.method(system.power, system),
    'reset': build.method(system.reset, system),
    'nvram': build.computed(nes.getNVRAM, nes),
    'use': build.method(useOptions),
    'rom': build.nested({
      'loaded': build.computed(rom.isLoaded, rom),
      'sha1': build.computed(rom.getSHA1, rom),
      'load': build.method(rom.load, rom),
      'unload': build.method(rom.unload, rom),
    }),
    'video': build.nested({
      'output': build.hiddenWritable(video.getOutput, video.setOutput, video),
      'renderer': build.writable(video.getRenderer, video.setRenderer, video),
      'palette': build.writable(video.getPalette, video.setPalette, video),
      'scale': build.writable(video.getScale, video.setScale, video),
      'filter': build.writable(video.getFilter, video.setFilter, video),
      'debug': build.writable(video.isDebug, video.setDebug, video),
    }),
    'fullscreen': build.nested({
      'type': build.writable(video.getFullscreenType, video.setFullscreenType, video),
      'is': build.computed(video.isFullscreen, video),
      'enter': build.method(video.enterFullscreen, video),
      'exit': build.method(video.exitFullscreen, video),
    }),
    'audio': audio ? build.nested({
      'enabled': build.writable(audio.isEnabled, audio.setEnabled, audio),
      'volume': build.nestedWritable(Object.keys(channels), audio.getVolume, audio.setVolume, audio),
    }) : build.constant(null),
    'devices': build.nestedWritable(ports, devices.get, devices.set, devices),
    'inputs': build.nested({
      'state': build.nested({
        'get': build.method(devices.getInput, devices),
        'set': build.method(devices.setInput, devices),
      }),
      'map': build.nested({
        'get': build.method(inputMap.get, inputMap),
        'set': build.method(inputMap.set, inputMap),
        'delete': build.method(inputMap.delete, inputMap),
      }),
      'record': build.method(sources.recordInput, sources),
    }),
    'config': build.nested({
      'get': build.method(getOptions),
      'use': build.method(useOptions),
    }),
    'toString': build.method(() => `${NAME} ${VERSION}`),
  });

  function getOptions() {
    const options = readPropertyValues(instance);
    options['inputs'] = inputMap.getAll();
    return options;
  }

  function useOptions(options) {
    writePropertyValues(instance, options);
    if ('inputs' in options) {
      inputMap.setAll(options['inputs']);
    }
  }

  useOptions(initOptions);

  const videoOptions = initOptions['video'];
  if (videoOptions && 'output' in videoOptions) {
    video.setOutput(videoOptions['output']);
  } else {
    const output = document.getElementById(NAME);
    if (output instanceof HTMLCanvasElement) {
      video.setOutput(output);
    }
  }

  if (!('inputs' in initOptions)) {
    inputMap.setAll({
      '1.joypad.a': 'keyboard.x',
      '1.joypad.b': ['keyboard.y', 'keyboard.z'],
      '1.joypad.start': 'keyboard.enter',
      '1.joypad.select': 'keyboard.shift',
      '1.joypad.up': 'keyboard.up',
      '1.joypad.down': 'keyboard.down',
      '1.joypad.left': 'keyboard.left',
      '1.joypad.right': 'keyboard.right',
      '2.zapper.trigger': 'mouse.left',
    });
  }

  if ('rom' in initOptions) {
    rom.load(initOptions['rom'])
      .then(() => system.start())
      .catch(log.error);
  }

  return instance;
}

defineProperties(cfxnes, {
  'name': build.constant(NAME),
  'version': build.constant(VERSION),
  'logLevel': build.writable(log.getLevel, log.setLevel),
  'close': build.constant(closeAudioContext),
});

// This export is only used by tests
export default cfxnes;

// AMD/CommonJS/global export (see umd.template file)
if (typeof root !== 'undefined') {
  root[NAME] = cfxnes; // eslint-disable-line no-undef
}
