//=========================================================
// CFxNES setup
//=========================================================

CFxNES.setLogLevel('all');

var cfxnes = new CFxNES({
  sha1: sha1,
  jszip: JSZip,
  screenfull: screenfull,
});

//=========================================================
// Application state
//=========================================================

var app = riot.observable({
  init: function() {
    this.reset();
    this.load();
  },
  reset: function() {
    this.fpsVisible = true;
    this.controlsVisible = true;
    this.controlsOpened = true;
    cfxnes.resetOptions();
  },
  load: function() {
    this.fpsVisible = localStorage.getItem('fpsVisible') !== 'false';
    this.controlsVisible = localStorage.getItem('controlsVisible') !== 'false';
    cfxnes.loadOptions();
  },
  save: function() {
    localStorage.setItem('fpsVisible', this.fpsVisible ? 'true' : 'false');
    localStorage.setItem('controlsVisible', this.controlsVisible ? 'true' : 'false');
    cfxnes.saveOptions();
  },
  route: function(view, param) {
    app.viewParam = param;
    app.trigger('route', view || 'emulator', param);
  },
  watch: function(events, tag, callback) {
    callback = callback.bind(tag);
    tag.on('mount', this.on.bind(this, events, callback));
    tag.on('unmount', this.off.bind(this, events, callback));
  },
});

app.init();

//=========================================================
// State persistence
//=========================================================

$(window).on('beforeunload', saveAll);
setInterval(saveAll, 60 * 1000);

function saveAll() {
    app.save();
    cfxnes.saveNVRAM().catch(logError);
}

//=========================================================
// RiotJS setup
//=========================================================

$(document).ready(function() {
  riot.mount('*');
  riot.route(app.route);
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
};

function getErrorMessage(object) {
  if (object.message) {
    return 'Error: ' + object.message; // Error
  }
  if (object.status) {
    return 'Error: Unable to download file (server response: ' + object.status + ' ' + object.statusText + ').'; // XMLHttpRequest
  }
  if (object.status === 0) {
    return 'Error: Unable to connect to the server.'; // XMLHttpRequest
  }
  return object;
};

function logError(error) {
  console.error(error);
}
