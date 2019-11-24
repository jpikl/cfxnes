/* global window, Buffer */

export function detectEndianness() {
  const u16 = new Uint16Array([0x1234]);
  const u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x34 ? 'LE' : 'BE';
}

export function decodeBase64(input) {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(input);
  }
  if (typeof Buffer === 'function') {
    return Buffer.from(input, 'base64').toString('binary');
  }
  throw new Error('Unable to decode base64 string');
}
