/* eslint-disable no-unused-vars, prefer-const */

cfxnes.logLevel = 'info';

const nes = cfxnes();
const {video, fullscreen, audio, rom, devices, inputs, config} = nes;
const {volume} = audio || {};
const defaults = config.get();
const bus = riot.observable({});
const maxVideoScale = ~~Math.min(screen.width / 256, screen.height / 240);

let fpsVisible = true;
let controlsVisible = true;
let controlsOpened = true;
let lastGameId = null;
let autoPaused = false;
let gameFilter = '';
let settingsPanel;
let viewParam;

try {
  load();
} catch (error) {
  logError(error);
}

$(window).on('beforeunload', save);
setInterval(save, 60 * 1000);

$(document).ready(() => {
  riot.mount('*');
  riot.route((view, param) => {
    view = view || 'emulator';
    viewParam = param;
    bus.trigger('route', view, param);
  });
  riot.route.start(true); // start + exec
});

function load() {
  const state = JSON.parse(localStorage.state || '{}');
  ({fpsVisible = true, controlsVisible = true} = state);
  config.use(state);
}

function save() {
  const state = Object.assign({fpsVisible, controlsVisible}, config.get());
  localStorage.state = JSON.stringify(state);
  saveNVRAM();
}

function loadNVRAM() {
  if (nes.nvram) {
    return getNVRAM(rom.sha1)
      .then(data => data && nes.nvram.set(data))
      .catch(logError);
  }
  return Promise.resolve();
}

function saveNVRAM() {
  if (nes.nvram) {
    return putNVRAM(rom.sha1, nes.nvram)
      .catch(logError);
  }
  return Promise.resolve();
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
