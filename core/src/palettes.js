/* eslint-disable camelcase */

import asq_real_a from './palettes/asq_real_a';
import asq_real_b from './palettes/asq_real_b';
import bmf_fin_r2 from './palettes/bmf_fin_r2';
import bmf_fin_r3 from './palettes/bmf_fin_r3';
import fceu_13 from './palettes/fceu_13';
import fceu_15 from './palettes/fceu_15';
import fceux from './palettes/fceux';
import nestopia_rgb from './palettes/nestopia_rgb';
import nestopia_yuv from './palettes/nestopia_yuv';
import {decodeBase64, isLittleEndian} from './utils';
import log from './log';

const PALETTE_LENGTH = 64;

const palettes = {
  'asq-real-a': asq_real_a,
  'asq-real-b': asq_real_b,
  'bmf-fin-r2': bmf_fin_r2,
  'bmf-fin-r3': bmf_fin_r3,
  'fceu-13': fceu_13,
  'fceu-15': fceu_15,
  'fceux': fceux,
  'nestopia-rgb': nestopia_rgb,
  'nestopia-yuv': nestopia_yuv,
};

export const packColor = isLittleEndian() ? packColorLE : packColorBE;
export const unpackColor = isLittleEndian() ? unpackColorLE : unpackColorBE;

export const BLACK_COLOR = packColor(0, 0, 0);

export function packColorLE(r, g, b, a = 0xFF) {
  return (a << 24 | b << 16 | g << 8 | r) >>> 0; // Convert to 32-bit unsigned integer
}

export function packColorBE(r, g, b, a = 0xFF) {
  return (r << 24 | g << 16 | b << 8 | a) >>> 0; // Convert to 32-bit unsigned integer
}

export function unpackColorLE(c) {
  return [c & 0xFF, (c >>> 8) & 0xFF, (c >>> 16) & 0xFF, (c >>> 24) & 0xFF];
}

export function unpackColorBE(c) {
  return [(c >>> 24) & 0xFF, (c >>> 16) & 0xFF, (c >>> 8) & 0xFF, c & 0xFF];
}

export function createPalette(id) {
  const base64 = palettes[id];
  if (base64) {
    log.info(`Creating "${id}" palette`);
    return readPalette(base64);
  }
  throw new Error(`Unknown palette "${id}"`);
}

function readPalette(base64) {
  const data = decodeBase64(base64);
  if (data.length !== PALETTE_LENGTH * 3) {
    throw new Error(`Palette data does not contains ${PALETTE_LENGTH} entries`);
  }
  const palette = new Uint32Array(PALETTE_LENGTH);
  for (let i = 0; i < PALETTE_LENGTH; i++) {
    const r = data.charCodeAt(3 * i);
    const g = data.charCodeAt(3 * i + 1);
    const b = data.charCodeAt(3 * i + 2);
    palette[i] = packColor(r, g, b);
  }
  return palette;
}

export function createPaletteVariant(palette, rRatio, gRatio, bRatio) {
  const paletteVariant = new Uint32Array(PALETTE_LENGTH);
  for (let i = 0; i < PALETTE_LENGTH; i++) {
    let [r, g, b] = unpackColor(palette[i]);
    r = Math.floor(rRatio * r);
    g = Math.floor(gRatio * g);
    b = Math.floor(bRatio * b);
    paletteVariant[i] = packColor(r, g, b);
  }
  return paletteVariant;
}
