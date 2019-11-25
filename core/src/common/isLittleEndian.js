/**
 * Detects endianness.
 * @returns {boolean} true for little-endian, false for big-endian.
 */
export default function isLittleEndian() {
  const u16 = new Uint16Array([0x1234]);
  const u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x34;
}
