/* eslint-disable no-unused-vars, prefer-const */

cfxnes.logLevel = 'info';

let nes, video, fullscreen, audio, volume,
  rom, nvram, devices, inputs, options;

try {
  nes = cfxnes();
  ({video, fullscreen, audio, audio: {volume},
    rom, nvram, devices, inputs, options} = nes);
  options.load();
} catch (error) {
  logError(error);
}

let fpsVisible = true;
let controlsVisible = true;
let controlsOpened = true;
let lastGameId = null;
let autoPaused = false;
let gameFilter = '';
let settingsPanel;
let viewParam;

try {
  const {state} = localStorage;
  if (state) {
    ({fpsVisible = true, controlsVisible = true} = JSON.parse(state));
  }
} catch (error) {
  logError(error);
}

const bus = riot.observable({});

if (nes) {
  $(window).on('beforeunload', save);
  setInterval(save, 60 * 1000);
}

$(document).ready(() => {
  riot.mount('*');
  riot.route((view, param) => {
    view = view || 'emulator';
    viewParam = param;
    bus.trigger('route', view, param);
  });
  riot.route.start(true); // start + exec
});

function save() {
  localStorage.state = JSON.stringify({fpsVisible, controlsVisible});
  nes.options.save();
  nes.nvram.save().catch(logError);
}

function eachTag(tags, callback) {
  if (tags != null) {
    if (tags.length == null) {
      callback(tags); // Single tag
    } else {
      tags.forEach(callback);
    }
  }
}

function formatError(error) {
  if (error.message) {
    return `Error: ${error.message}`; // Error
  }
  if (error.status) {
    return `Error: Unable to download file (${error.status} ${error.statusText}).`; // XMLHttpRequest
  }
  if (error.status === 0) {
    return 'Error: Unable to connect to the server.'; // XMLHttpRequest
  }
  return error;
}

function logError(error) {
  console.error(error);
}
