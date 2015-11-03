import { zeroArray } from './arrays';

//=========================================================
// System utilities
//=========================================================

detectEndianness(); /* Extra call to disable inlining of this function by closure compiler.
                       The inlined value is incorrect. */

export const ENDIANNESS = detectEndianness();

export function detectEndianness() {
  var buffer = new ArrayBuffer(4);
  var u32 = new Uint32Array(buffer);
  var u8 = new Uint8Array(buffer);
  u32[0] = 0xFF;
  return (u8[0] === 0xFF) ? 'LE' : 'BE';
}

export function newByteArray(size) {
  return new Uint8Array(size);
}

export function newUintArray(size) {
  // For some strange reason, Uint32Array is much slower
  // than ordinary array in Chrome.
  var data = new Array(size);
  zeroArray(data);
  return data;
}
