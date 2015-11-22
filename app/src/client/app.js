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
  gameFilter: '',
  fpsEnabled: localStorage.getItem('fpsEnabled') !== 'false',
  controlsInfoEnabled: localStorage.getItem('controlsInfoEnabled') !== 'false',
  controlsInfoVisible: true,
  save: function() {
    localStorage.setItem('fpsEnabled', this.fpsEnabled ? 'true' : 'false');
    localStorage.setItem('controlsInfoEnabled', this.controlsInfoEnabled ? 'true' : 'false');
  },
  route: function(view, param) {
    app.trigger('route', view, param);
  },
  watch: function(events, tag, callback) {
    callback = callback.bind(tag);
    tag.on('mount', this.on.bind(this, events, callback));
    tag.on('unmount', this.off.bind(this, events, callback));
  },
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

function findTag(root, name) {
  var tag = root.tags[name];
  if (tag != null) {
    return tag;
  }
  for (var id in root.tags) {
    var tags = root.tags[id];
    if (tags.length == null) {
      tags = [tags];
    }
    for (var i = 0; i < tags.length; i++) {
      var tag = findTag(tags[i], name);
      if (tag != null) {
        return tag;
      }
    }
  }
}

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

//=========================================================
// RiotJS setup
//=========================================================

riot.route.parser(function(path) {
  if (path.length && path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1);
  }
  var parts = path.split('/').splice(1);
  return parts.length > 0 ? parts : ['emulator'];
});
riot.route(app.route);

//=========================================================
// Mount
//=========================================================

$(document).ready(function() {
  riot.mount('*');
  riot.route.exec(app.route);
});
