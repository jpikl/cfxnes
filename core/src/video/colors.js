import {detectEndianness} from '../common';

const le = detectEndianness() === 'LE';

export const packColor = le ? packColorLE : packColorBE;
export const unpackColor = le ? unpackColorLE : unpackColorBE;

export const BLACK_COLOR = packColor(0, 0, 0);

export function packColorLE(r, g, b, a = 0xFF) {
  return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0; // Convert to 32-bit unsigned integer
}

export function packColorBE(r, g, b, a = 0xFF) {
  return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0; // Convert to 32-bit unsigned integer
}

export function unpackColorLE(c) {
  return [c & 0xFF, (c >>> 8) & 0xFF, (c >>> 16) & 0xFF, (c >>> 24) & 0xFF];
}

export function unpackColorBE(c) {
  return [(c >>> 24) & 0xFF, (c >>> 16) & 0xFF, (c >>> 8) & 0xFF, c & 0xFF];
}
