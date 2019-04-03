import {NES, log, LogLevel, describe} from '../../core';
import {Audio, hasAudioContext, closeAudioContext, channels} from './audio';
import {Sources, Devices, InputMap, InputRouter, ports} from './input';
import {System} from './system';
import {Video} from './video';
import {ROM} from './rom';

import {
  readProperties,
  writeProperties,
  constantProperty,
  computedProperty,
  writableProperty,
  hiddenWritableProperty,
  methodProperty,
  nestedProperty,
  nestedWritableProperty,
} from './properties';

const NAME = 'cfxnes';
const VERSION = '0.7.0';

const {defineProperties} = Object;

function cfxnes(initOptions = {}) {
  if (!initOptions || typeof initOptions !== 'object') {
    throw new Error('Invalid initialization options: ' + describe(initOptions));
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
    'running': computedProperty(system.isRunning, system),
    'fps': computedProperty(system.getFPS, system),
    'region': writableProperty(system.getRegion, system.setRegion, system),
    'speed': writableProperty(system.getSpeed, system.setSpeed, system),
    'start': methodProperty(system.start, system),
    'stop': methodProperty(system.stop, system),
    'step': methodProperty(system.step, system),
    'power': methodProperty(system.power, system),
    'reset': methodProperty(system.reset, system),
    'nvram': computedProperty(nes.getNVRAM, nes),
    'use': methodProperty(useOptions),
    'rom': nestedProperty({
      'loaded': computedProperty(rom.isLoaded, rom),
      'sha1': computedProperty(rom.getSHA1, rom),
      'load': methodProperty(rom.load, rom),
      'unload': methodProperty(rom.unload, rom),
    }),
    'video': nestedProperty({
      'output': hiddenWritableProperty(video.getOutput, video.setOutput, video),
      'renderer': writableProperty(video.getRenderer, video.setRenderer, video),
      'palette': writableProperty(video.getPalette, video.setPalette, video),
      'scale': writableProperty(video.getScale, video.setScale, video),
      'filter': writableProperty(video.getFilter, video.setFilter, video),
      'debug': writableProperty(video.isDebug, video.setDebug, video),
      'clear': methodProperty(video.clearFrame, video),
    }),
    'fullscreen': nestedProperty({
      'type': writableProperty(video.getFullscreenType, video.setFullscreenType, video),
      'is': computedProperty(video.isFullscreen, video),
      'enter': methodProperty(video.enterFullscreen, video),
      'exit': methodProperty(video.exitFullscreen, video),
    }),
    'audio': audio ? nestedProperty({
      'enabled': writableProperty(audio.isEnabled, audio.setEnabled, audio),
      'volume': nestedWritableProperty(Object.keys(channels), audio.getVolume, audio.setVolume, audio),
    }) : constantProperty(null),
    'devices': nestedWritableProperty(ports, devices.get, devices.set, devices),
    'inputs': nestedProperty({
      'state': nestedProperty({
        'get': methodProperty(devices.getInput, devices),
        'set': methodProperty(devices.setInput, devices),
      }),
      'map': nestedProperty({
        'get': methodProperty(inputMap.get, inputMap),
        'set': methodProperty(inputMap.set, inputMap),
        'delete': methodProperty(inputMap.delete, inputMap),
      }),
      'record': methodProperty(sources.recordInput, sources),
    }),
    'config': nestedProperty({
      'get': methodProperty(getOptions),
      'use': methodProperty(useOptions),
    }),
    'toString': methodProperty(() => `${NAME} ${VERSION}`),
  });

  function getOptions() {
    const options = readProperties(instance);
    options['inputs'] = inputMap.getAll();
    return options;
  }

  function useOptions(options) {
    writeProperties(instance, options);
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
      .catch(error => {
        log.error('Failed to load ROM', error);
      });
  }

  return instance;
}

log.setLevel(LogLevel.WARN);

try {
  defineProperties(cfxnes, {'name': constantProperty(NAME)});
} catch (error) {
  log.warn('Unable to redefine cfxnes.name property: running in pre-ES2015 environment');
}

defineProperties(cfxnes, {
  'version': constantProperty(VERSION),
  'logLevel': writableProperty(log.getLevel, log.setLevel, log),
  'close': constantProperty(closeAudioContext),
});

// This export is only used by tests
export default cfxnes;

// AMD/CommonJS/global export (see umd.template file)
if (typeof root !== 'undefined') {
  root[NAME] = cfxnes; // eslint-disable-line no-undef
}
