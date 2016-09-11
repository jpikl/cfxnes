/* eslint-disable no-unused-vars, prefer-const */

cfxnes.logLevel = 'info';

const nes = cfxnes();
const {video, fullscreen, audio, rom, nvram, devices, inputs, config} = nes;
const {volume} = audio || {};
const bus = riot.observable({});

const defaultConfig = config.get();
const defaultDevice1 = devices[1];
const defaultDevice2 = devices[2];
const defaultInputs = inputs.get();

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
  if (state) {
    config.set(state);
    ({fpsVisible = true, controlsVisible = true} = state);
  }
}

function save() {
  const state = Object.assign({fpsVisible, controlsVisible}, config.get());
  localStorage.config = JSON.stringify(state);
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
