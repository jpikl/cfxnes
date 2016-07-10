/* global CFxNES, sha1, JSZip, screenfull */
/* eslint-disable no-unused-vars */

//=========================================================
// CFxNES setup
//=========================================================

CFxNES.setLogLevel('info');

const cfxnes = new CFxNES({sha1, JSZip, screenfull});

//=========================================================
// App state
//=========================================================

const app = riot.observable({
  init() {
    app.fpsVisible = localStorage.getItem('fpsVisible') !== 'false';
    app.controlsVisible = localStorage.getItem('controlsVisible') !== 'false';
    app.controlsOpened = true;
    cfxnes.loadOptions();
  },
  reset() {
    app.fpsVisible = true;
    app.controlsVisible = true;
    app.controlsOpened = true;
    cfxnes.resetOptions();
  },
  save() {
    localStorage.setItem('fpsVisible', app.fpsVisible ? 'true' : 'false');
    localStorage.setItem('controlsVisible', app.controlsVisible ? 'true' : 'false');
    cfxnes.saveOptions();
    cfxnes.saveNVRAM().catch(logError);
  },
});

app.init();

//=========================================================
// State persistence
//=========================================================

$(window).on('beforeunload', app.save);
setInterval(app.save, 60 * 1000);

//=========================================================
// RiotJS setup
//=========================================================

$(document).ready(() => {
  riot.mount('*');
  riot.route((view, param) => {
    app.view = view || 'emulator';
    app.viewParam = param;
    app.trigger('route', app.view, app.viewParam);
  });
  riot.route.start(true); // start + exec
});

//=========================================================
// Utilities
//=========================================================

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
    return `Error: Unable to download file (${error.status} - ${error.statusText}).`; // XMLHttpRequest
  }
  if (error.status === 0) {
    return 'Error: Unable to connect to the server.'; // XMLHttpRequest
  }
  return error;
}

function logError(error) {
  console.error(error);
}
