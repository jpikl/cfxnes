import {assert} from '../../core/src/common/utils';
import NES from '../../core/src/NES';
import log from '../../core/src/common/log';
import {define} from './common/properties';
import Audio from './audio/Audio';
import ROM from './data/ROM';
import Config from './data/Config';
import Sources from './input/Sources';
import Devices from './input/Devices';
import InputMap from './input/InputMap';
import InputRouter from './input/InputRouter';
import System from './system/System';
import Video from './video/Video';
import {ports} from './input/common';
import {channels} from './audio/Mixer';
import {hasAudioContext, closeAudioContext} from './audio/context';

function cfxnes(params = {}) {
  assert(params && typeof params === 'object');

  const JSZip = params['JSZip'] || window['JSZip'];
  const nes = new NES;
  const video = new Video(nes);
  const audio = hasAudioContext() ? new Audio(nes) : null;
  const devices = new Devices(nes);
  const inputs = new InputMap;
  const router = new InputRouter(inputs, devices, video);
  const sources = new Sources(router);
  const system = new System(nes, video, audio, sources);
  const rom = new ROM(nes, system, JSZip);

  const regionProperty = define.writable(system.getRegion, system.setRegion, system);
  const speedProperty = define.writable(system.getSpeed, system.setSpeed, system);
  const videoOutputProperty = define.writable(video.getOutput, video.setOutput, video);
  const videoRendererProperty = define.writable(video.getRenderer, video.setRenderer, video);
  const videoPaletteProperty = define.writable(video.getPalette, video.setPalette, video);
  const videoScaleProperty = define.writable(video.getScale, video.setScale, video);
  const videoFilterProperty = define.writable(video.getFilter, video.setFilter, video);
  const videoDebugProperty = define.writable(video.isDebug, video.setDebug, video);
  const fullscreenTypeProperty = define.writable(video.getFullscreenType, video.setFullscreenType, video);
  const audioEnabledProperty = audio ? define.writable(audio.isEnabled, audio.setEnabled, audio) : null;
  const audioVolumeProperties = audio ? define.writableMap(Object.keys(channels), audio.getVolume, audio.setVolume, audio) : {};
  const devicesProperties = define.writableMap(ports, devices.get, devices.set, devices);
  const inputsProperty = define.writable(inputs.get, inputs.set, inputs);

  const config = new Config;
  config.add(['region'], regionProperty);
  config.add(['speed'], speedProperty);
  config.add(['video', 'renderer'], videoRendererProperty);
  config.add(['video', 'palette'], videoPaletteProperty);
  config.add(['video', 'scale'], videoScaleProperty);
  config.add(['video', 'filter'], videoFilterProperty);
  config.add(['video', 'debug'], videoDebugProperty);
  config.add(['fullscreen', 'type'], fullscreenTypeProperty);
  if (audio) {
    config.add(['audio', 'enabled'], audioEnabledProperty);
    for (const channel in channels) {
      config.add(['audio', 'volume', channel], audioVolumeProperties[channel]);
    }
  }
  for (const port of ports) {
    config.add(['devices', port], devicesProperties[port]);
  }
  config.add(['inputs'], inputsProperty);
  config.set(params);

  const videoParams = params['video'];
  if (videoParams && 'output' in videoParams) {
    video.setOutput(videoParams['output']);
  } else {
    const output = document.getElementById('cfxnes');
    if (output instanceof HTMLCanvasElement) {
      video.setOutput(output);
    }
  }

  if (!('inputs' in params)) {
    inputs.setAll({
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

  if ('rom' in params) {
    rom.load(params['rom'])
      .then(() => system.start())
      .catch(log.error);
  }

  return define.object({
    'running': define.computed(system.isRunning, system),
    'fps': define.computed(system.getFPS, system),
    'region': regionProperty,
    'speed': speedProperty,
    'start': define.method(system.start, system),
    'stop': define.method(system.stop, system),
    'step': define.method(system.step, system),
    'power': define.method(system.power, system),
    'reset': define.method(system.reset, system),
    'nvram': define.computed(nes.getNVRAM, nes),
    'rom': define.nested({
      'loaded': define.computed(rom.isLoaded, rom),
      'sha1': define.computed(rom.getSHA1, rom),
      'load': define.method(rom.load, rom),
      'unload': define.method(rom.unload, rom),
    }),
    'video': define.nested({
      'output': videoOutputProperty,
      'renderer': videoRendererProperty,
      'palette': videoPaletteProperty,
      'scale': videoScaleProperty,
      'filter': videoFilterProperty,
      'debug': videoDebugProperty,
    }),
    'fullscreen': define.nested({
      'type': fullscreenTypeProperty,
      'is': define.computed(video.isFullscreen, video),
      'enter': define.method(video.enterFullscreen, video),
      'exit': define.method(video.exitFullscreen, video),
    }),
    'audio': define.nested(audio && {
      'enabled': audioEnabledProperty,
      'volume': define.nested(audioVolumeProperties),
    }),
    'devices': define.nested(devicesProperties),
    'inputs': define.nested({
      'set': define.method(inputs.set, inputs),
      'get': define.method(inputs.get, inputs),
      'delete': define.method(inputs.delete, inputs),
      'record': define.method(sources.recordInput, sources),
    }),
    'config': define.nested({
      'get': define.method(config.get, config),
      'set': define.method(config.set, config),
    }),
  });
}

define.properties(cfxnes, {
  'version': define.constant('0.5.0'),
  'logLevel': define.writable(log.getLevel, log.setLevel),
  'close': define.constant(closeAudioContext),
});

// This export is only used by tests
export default cfxnes;

// AMD/CommonJS/global export (see umd.template file)
if (typeof root !== 'undefined') {
  root['cfxnes'] = cfxnes; // eslint-disable-line no-undef
}
