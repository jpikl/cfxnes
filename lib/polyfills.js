/* eslint-disable import/no-unassigned-import */
/* eslint-disable no-extend-native */

// Polyfills needed by the cfxnes library.

require('core-js/modules/es6.array.fill');
require('core-js/modules/es6.array.find');
require('core-js/modules/es6.object.assign');
require('core-js/modules/es6.promise');

if (!Uint8Array.prototype.fill) {
  Uint8Array.prototype.fill = Array.prototype.fill;
}

if (!Uint32Array.prototype.fill) {
  Uint32Array.prototype.fill = Array.prototype.fill;
}

if (!Float32Array.prototype.fill) {
  Float32Array.prototype.fill = Array.prototype.fill;
}
