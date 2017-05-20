import {log, toString} from '../../core/src/common';
import NES from '../../core/src/NES';
import {buildProp, readProps, writeProps} from './props';
import {Audio, hasAudioContext, closeAudioContext, channels} from './audio';
import {Sources, Devices, InputMap, InputRouter, ports} from './input';
import {System} from './system';
import {Video} from './video';
import {ROM} from './rom';

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
    'running': buildProp.computed(system.isRunning, system),
    'fps': buildProp.computed(system.getFPS, system),
    'region': buildProp.writable(system.getRegion, system.setRegion, system),
    'speed': buildProp.writable(system.getSpeed, system.setSpeed, system),
    'start': buildProp.method(system.start, system),
    'stop': buildProp.method(system.stop, system),
    'step': buildProp.method(system.step, system),
    'power': buildProp.method(system.power, system),
    'reset': buildProp.method(system.reset, system),
    'nvram': buildProp.computed(nes.getNVRAM, nes),
    'use': buildProp.method(useOptions),
    'rom': buildProp.nested({
      'loaded': buildProp.computed(rom.isLoaded, rom),
      'sha1': buildProp.computed(rom.getSHA1, rom),
      'load': buildProp.method(rom.load, rom),
      'unload': buildProp.method(rom.unload, rom),
    }),
    'video': buildProp.nested({
      'output': buildProp.hiddenWritable(video.getOutput, video.setOutput, video),
      'renderer': buildProp.writable(video.getRenderer, video.setRenderer, video),
      'palette': buildProp.writable(video.getPalette, video.setPalette, video),
      'scale': buildProp.writable(video.getScale, video.setScale, video),
      'filter': buildProp.writable(video.getFilter, video.setFilter, video),
      'debug': buildProp.writable(video.isDebug, video.setDebug, video),
    }),
    'fullscreen': buildProp.nested({
      'type': buildProp.writable(video.getFullscreenType, video.setFullscreenType, video),
      'is': buildProp.computed(video.isFullscreen, video),
      'enter': buildProp.method(video.enterFullscreen, video),
      'exit': buildProp.method(video.exitFullscreen, video),
    }),
    'audio': audio ? buildProp.nested({
      'enabled': buildProp.writable(audio.isEnabled, audio.setEnabled, audio),
      'volume': buildProp.nestedWritable(Object.keys(channels), audio.getVolume, audio.setVolume, audio),
    }) : buildProp.constant(null),
    'devices': buildProp.nestedWritable(ports, devices.get, devices.set, devices),
    'inputs': buildProp.nested({
      'state': buildProp.nested({
        'get': buildProp.method(devices.getInput, devices),
        'set': buildProp.method(devices.setInput, devices),
      }),
      'map': buildProp.nested({
        'get': buildProp.method(inputMap.get, inputMap),
        'set': buildProp.method(inputMap.set, inputMap),
        'delete': buildProp.method(inputMap.delete, inputMap),
      }),
      'record': buildProp.method(sources.recordInput, sources),
    }),
    'config': buildProp.nested({
      'get': buildProp.method(getOptions),
      'use': buildProp.method(useOptions),
    }),
    'toString': buildProp.method(() => `${NAME} ${VERSION}`),
  });

  function getOptions() {
    const options = readProps(instance);
    options['inputs'] = inputMap.getAll();
    return options;
  }

  function useOptions(options) {
    writeProps(instance, options);
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
  'name': buildProp.constant(NAME),
  'version': buildProp.constant(VERSION),
  'logLevel': buildProp.writable(log.getLevel, log.setLevel),
  'close': buildProp.constant(closeAudioContext),
});

// This export is only used by tests
export default cfxnes;

// AMD/CommonJS/global export (see umd.template file)
if (typeof root !== 'undefined') {
  root[NAME] = cfxnes; // eslint-disable-line no-undef
}
