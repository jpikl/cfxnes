/* global CFxNES */
/* eslint-disable no-unused-vars */

//=========================================================
// CFxNES setup
//=========================================================

CFxNES.setLogLevel('info');

let cfxnes;

try {
  cfxnes = new CFxNES;
} catch (error) {
  logError(error);
}

//=========================================================
// App state
//=========================================================

const app = riot.observable({
  init() {
    app.fpsVisible = localStorage.fpsVisible !== 'false';
    app.controlsVisible = localStorage.controlsVisible !== 'false';
    app.controlsOpened = true;
    if (cfxnes) {
      cfxnes.loadOptions();
    }
  },
  reset() {
    app.fpsVisible = true;
    app.controlsVisible = true;
    app.controlsOpened = true;
    if (cfxnes) {
      cfxnes.resetOptions();
    }
  },
  save() {
    localStorage.fpsVisible = app.fpsVisible ? 'true' : 'false';
    localStorage.controlsVisible = app.controlsVisible ? 'true' : 'false';
    if (cfxnes) {
      cfxnes.saveOptions();
      cfxnes.saveNVRAM().catch(logError);
    }
  },
});

try {
  app.init();
} catch (error) {
  logError(error);
}

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
