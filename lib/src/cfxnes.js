import {assert} from '../../core/src/common/utils';
import NES from '../../core/src/NES';
import log from '../../core/src/common/log';
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

const {defineProperties} = Object;

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

  const regionProperty = {
    set: system.setRegion.bind(system),
    get: system.getRegion.bind(system),
  };

  const speedProperty = {
    set: system.setSpeed.bind(system),
    get: system.getSpeed.bind(system),
  };

  const videoOutputProperty = {
    set: video.setOutput.bind(video),
    get: video.getOutput.bind(video),
  };

  const videoRendererProperty = {
    set: video.setRenderer.bind(video),
    get: video.getRenderer.bind(video),
  };

  const videoPaletteProperty = {
    set: video.setPalette.bind(video),
    get: video.getPalette.bind(video),
  };

  const videoScaleProperty = {
    set: video.setScale.bind(video),
    get: video.getScale.bind(video),
  };

  const videoFilterProperty = {
    set: video.setFilter.bind(video),
    get: video.getFilter.bind(video),
  };

  const videoDebugProperty = {
    set: video.setDebug.bind(video),
    get: video.isDebug.bind(video),
  };

  const fullscreenTypeProperty = {
    set: video.setFullscreenType.bind(video),
    get: video.getFullscreenType.bind(video),
  };

  const audioEnabledProperty = audio && {
    set: audio.setEnabled.bind(audio),
    get: audio.isEnabled.bind(audio),
  };

  const audioVolumeProperty = {};
  for (const channel in channels) {
    audioVolumeProperty[channel] = audio && {
      set: audio.setVolume.bind(audio, channel),
      get: audio.getVolume.bind(audio, channel),
      enumerable: true,
    };
  }

  const devicesProperty = {};
  for (const port of ports) {
    devicesProperty[port] = {
      set: devices.set.bind(devices, port),
      get: devices.get.bind(devices, port),
      enumerable: true,
    };
  }

  const inputsProperty = {
    set: inputs.setAll.bind(inputs),
    get: inputs.getAll.bind(inputs),
  };

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
      config.add(['audio', 'volume', channel], audioVolumeProperty[channel]);
    }
  }
  for (const port of ports) {
    config.add(['devices', port], devicesProperty[port]);
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

  return defineProperties({}, {
    'running': {get: system.isRunning.bind(system)},
    'fps': {get: system.getFPS.bind(system)},
    'region': regionProperty,
    'speed': speedProperty,
    'start': {value: system.start.bind(system)},
    'stop': {value: system.stop.bind(system)},
    'step': {value: system.step.bind(system)},
    'power': {value: system.power.bind(system)},
    'reset': {value: system.reset.bind(system)},
    'nvram': {get: nes.getNVRAM.bind(nes)},
    'rom': {
      'value': defineProperties({}, {
        'loaded': {get: rom.isLoaded.bind(rom)},
        'sha1': {get: rom.getSHA1.bind(rom)},
        'load': {value: rom.load.bind(rom)},
        'unload': {value: rom.unload.bind(rom)},
      }),
    },
    'video': {
      'value': defineProperties({}, {
        'output': videoOutputProperty,
        'renderer': videoRendererProperty,
        'palette': videoPaletteProperty,
        'scale': videoScaleProperty,
        'filter': videoFilterProperty,
        'debug': videoDebugProperty,
      }),
    },
    'fullscreen': {
      'value': defineProperties({}, {
        'type': fullscreenTypeProperty,
        'is': {get: video.isFullscreen.bind(video)},
        'enter': {value: video.enterFullscreen.bind(video)},
        'exit': {value: video.exitFullscreen.bind(video)},
      }),
    },
    'audio': {
      'value': audio ? defineProperties({}, {
        'enabled': audioEnabledProperty,
        'volume': {
          value: defineProperties({}, audioVolumeProperty),
        },
      }) : null,
    },
    'devices': {
      'value': defineProperties({}, devicesProperty),
    },
    'inputs': {
      value: defineProperties({}, {
        'set': {value: inputs.set.bind(inputs)},
        'get': {value: inputs.get.bind(inputs)},
        'delete': {value: inputs.delete.bind(inputs)},
        'record': {value: sources.recordInput.bind(sources)},
      }),
    },
    'config': {
      'value': defineProperties({}, {
        'get': {value: config.get.bind(config)},
        'set': {value: config.set.bind(config)},
      }),
    },
  });
}

defineProperties(cfxnes, {
  'version': {value: '0.5.0'},
  'logLevel': {set: log.setLevel, get: log.getLevel},
  'close': {value: closeAudioContext},
});

// This export is only used by tests
export default cfxnes;

// AMD/CommonJS/global export (see umd.template file)
if (typeof root !== 'undefined') {
  root['cfxnes'] = cfxnes; // eslint-disable-line no-undef
}
