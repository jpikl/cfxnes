//=========================================================
// System utilities
//=========================================================

detectEndianness(); /* Extra call to disable inlining of this function by closure compiler.
                       The inlined value is incorrect. */

export const ENDIANNESS = detectEndianness();

export function detectEndianness() {
  var u16 = new Uint16Array([0x1234]);
  var u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x12 ? 'BE' : 'LE';
}
