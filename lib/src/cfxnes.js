/* eslint-env amd */

import {assert} from '../../core/src/common/utils';
import NES from '../../core/src/NES';
import log from '../../core/src/common/log';
import Audio from './audio/Audio';
import ROM from './data/ROM';
import NVRAM from './data/NVRAM';
import Options from './data/Options';
import Sources from './input/Sources';
import Devices from './input/Devices';
import InputMap from './input/InputMap';
import InputRouter from './input/InputRouter';
import System from './system/System';
import Video from './video/Video';
import {ports} from './input/common';
import {channels} from './audio/Mixer';
import {closeDB} from './data/database';
import {closeAudioContext} from './audio/context';

const {defineProperties} = Object;

function create(params = {}) {
  assert(params && typeof params === 'object');

  const JSZip = params['JSZip'] || window['JSZip'];
  const nes = new NES;
  const video = new Video(nes);
  const audio = new Audio(nes);
  const devices = new Devices(nes);
  const inputs = new InputMap;
  const router = new InputRouter(inputs, devices, video);
  const sources = new Sources(router);
  const system = new System(nes, video, audio, sources);
  const rom = new ROM(nes, system, JSZip);
  const nvram = new NVRAM(nes);

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

  const videoSmoothingProperty = {
    set: video.setSmoothing.bind(video),
    get: video.isSmoothing.bind(video),
  };

  const videoDebugProperty = {
    set: video.setDebug.bind(video),
    get: video.isDebug.bind(video),
  };

  const fullscreenTypeProperty = {
    set: video.setFullscreenType.bind(video),
    get: video.getFullscreenType.bind(video),
  };

  const audioEnabledProperty = {
    set: audio.setEnabled.bind(audio),
    get: audio.isEnabled.bind(audio),
  };

  const audioVolumeProperty = {};
  for (const channel in channels) {
    audioVolumeProperty[channel] = {
      set: audio.setVolume.bind(audio, channel),
      get: audio.getVolume.bind(audio, channel),
    };
  }

  const devicesProperty = {};
  for (const port of ports) {
    devicesProperty[port] = {
      set: devices.set.bind(devices, port),
      get: devices.get.bind(devices, port),
    };
  }

  const inputsProperty = {
    set: inputs.setAll.bind(inputs),
    get: inputs.getAll.bind(inputs),
  };

  const options = new Options;
  options.add(['region'], regionProperty);
  options.add(['speed'], speedProperty);
  options.add(['video', 'renderer'], videoRendererProperty);
  options.add(['video', 'palette'], videoPaletteProperty);
  options.add(['video', 'scale'], videoScaleProperty);
  options.add(['video', 'smoothing'], videoSmoothingProperty);
  options.add(['video', 'debug'], videoDebugProperty);
  options.add(['fullscreen', 'type'], fullscreenTypeProperty);
  options.add(['audio', 'enabled'], audioEnabledProperty);
  for (const channel in channels) {
    options.add(['audio', 'volume', channel], audioVolumeProperty[channel]);
  }
  for (const port of ports) {
    options.add(['devices', port], devicesProperty[port]);
  }
  options.add(['inputs'], inputsProperty);
  options.set(params);

  const videoParams = params['video'];
  if (videoParams && 'output' in videoParams) {
    video.setOutput(videoParams['output']);
  } else {
    const output = document.getElementById('cfxnes');
    if (output instanceof HTMLCanvasElement) {
      video.setOutput(output);
    }
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
    'rom': {
      'value': defineProperties({}, {
        'loaded': {get: rom.isLoaded.bind(rom)},
        'sha1': {get: rom.getSHA1.bind(rom)},
        'load': {value: rom.load.bind(rom)},
        'unload': {value: rom.unload.bind(rom)},
      }),
    },
    'nvram': {
      'value': defineProperties({}, {
        'data': {get: nvram.access.bind(nvram)},
        'load': {value: nvram.load.bind(nvram)},
        'save': {value: nvram.save.bind(nvram)},
        'deleteAll': {value: nvram.deleteAll.bind(nvram)},
      }),
    },
    'video': {
      'value': defineProperties({}, {
        'output': videoOutputProperty,
        'renderer': videoRendererProperty,
        'palette': videoPaletteProperty,
        'scale': videoScaleProperty,
        'maxScale': {get: video.getMaxScale.bind(video)},
        'smoothing': videoSmoothingProperty,
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
      'value': defineProperties({}, {
        'enabled': audioEnabledProperty,
        'volume': {
          value: defineProperties({}, audioVolumeProperty),
        },
      }),
    },
    'devices': {
      'value': defineProperties({}, devicesProperty),
    },
    'inputs': {
      value: defineProperties({}, {
        'map': {value: inputs.put.bind(inputs)},
        'unmap': {value: inputs.removeAll.bind(inputs)},
        'get': {value: inputs.get.bind(inputs)},
        'record': {value: sources.recordInput.bind(sources)},
      }),
    },
    'options': {
      'value': defineProperties({}, {
        'get': {value: options.get.bind(options)},
        'set': {value: options.set.bind(options)},
        'reset': {value: options.reset.bind(options)},
        'save': {value: options.save.bind(options)},
        'load': {value: options.load.bind(options)},
        'delete': {value: options.delete.bind(options)},
      }),
    },
  });
}

function close() {
  return Promise.all([closeDB(), closeAudioContext()]);
}

defineProperties(create, {
  'version': {value: '<version-placeholder>'},
  'logLevel': {set: log.setLevel, get: log.getLevel},
  'close': {value: close},
});

if (typeof define === 'function' && define['amd']) {
  define('cfxnes', () => create);
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = create;
} else {
  window['cfxnes'] = create;
}
