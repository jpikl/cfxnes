import { ENDIANNESS } from './system';

const _ENDIANNESS = ENDIANNESS; // Closure compiler bug workaround (ENDIANNESS can't be used as a default parameter)

//=========================================================
// Color manipulation utilities
//=========================================================

export const BLACK_COLOR = packColor(0, 0, 0);

export function packColor(r, g, b, a = 0xFF, endianness = _ENDIANNESS) {
  if (endianness === 'LE') {
    return (a << 24 | b << 16 | g << 8 | r) >>> 0; // Convert to 32-bit unsigned integer
  } else {
    return (r << 24 | g << 16 | b << 8 | a) >>> 0;
  }
}

export function unpackColor(color, endianness = _ENDIANNESS) {
  if (endianness === 'LE') {
    return [
      color & 0xFF,
      (color >>> 8) & 0xFF,
      (color >>> 16) & 0xFF,
      (color >>> 24) & 0xFF,
    ];
  } else {
    return [
      (color >>> 24) & 0xFF,
      (color >>> 16) & 0xFF,
      (color >>> 8) & 0xFF,
      color & 0xFF,
    ];
  }
}
