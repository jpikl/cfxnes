//=========================================================
// System utilities
//=========================================================

detectEndianness(); /* Extra call to disable inlining of this function by closure compiler.
                       The inlined value is incorrect. */

export const ENDIANNESS = detectEndianness();

export function detectEndianness() {
  const u16 = new Uint16Array([0x1234]);
  const u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x12 ? 'BE' : 'LE';
}
