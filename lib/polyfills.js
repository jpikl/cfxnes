/* eslint-disable import/no-unassigned-import */
/* eslint-disable no-extend-native */

// Polyfills needed by the cfxnes library.

require('core-js/modules/es6.array.fill'); //  IE11
require('core-js/modules/es6.array.find'); // IE11
require('core-js/modules/es6.object.assign'); // IE11
require('core-js/modules/es6.promise'); // IE11

// IE11, SF9
if (!Uint8Array.prototype.fill) {
  Uint8Array.prototype.fill = Array.prototype.fill;
}
if (!Uint32Array.prototype.fill) {
  Uint32Array.prototype.fill = Array.prototype.fill;
}
if (!Float32Array.prototype.fill) {
  Float32Array.prototype.fill = Array.prototype.fill;
}
