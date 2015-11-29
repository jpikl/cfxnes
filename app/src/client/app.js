//=========================================================
// CFxNES setup
//=========================================================

CFxNES.setLogLevel('all');

var cfxnes = new CFxNES({
  hash: md5,
  jszip: JSZip,
  screenfull: screenfull,
  storage: 'browser',
  loadOnStart: true,
  saveOnClose: true,
  savePeriod: 60, // sec
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
  },
  load: function() {
    this.fpsVisible = localStorage.getItem('fpsVisible') !== 'false';
    this.controlsVisible = localStorage.getItem('controlsVisible') !== 'false';
  },
  save: function() {
    localStorage.setItem('fpsVisible', this.fpsVisible ? 'true' : 'false');
    localStorage.setItem('controlsVisible', this.controlsVisible ? 'true' : 'false');
  },
  route: function(view, param) {
    if (app.view !== view || app.viewParam !== param) { // Workaround for https://github.com/riot/route/issues/28
      app.view = view;
      app.viewParam = param;
      app.trigger('route', view || 'emulator', param);
    }
  },
  watch: function(events, tag, callback) {
    callback = callback.bind(tag);
    tag.on('mount', this.on.bind(this, events, callback));
    tag.on('unmount', this.off.bind(this, events, callback));
  },
});

app.init();

//=========================================================
// RiotJS setup
//=========================================================

$(document).ready(function() {
  riot.mount('*');
  riot.route(app.route);
  riot.route.start(true); // start + exec
});

$(window).on('hashchange', function() {
  riot.route.exec(); // Workaround for https://github.com/riot/route/issues/28
})

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

function getErrorMessage(error) {
  if (error.message) {
    return 'Error: ' + error.message; // Error object
  }
  if (error.status) {
    return 'Error: Unable to download file (server response: ' + error.status + ' ' + error.statusText + ').'; // JQuery response
  }
  if (error.status === 0) {
    return 'Error: Unable to connect to server.'; // JQuery response
  }
  return error;
};
