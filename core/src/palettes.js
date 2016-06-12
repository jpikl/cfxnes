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
import logger from './utils/logger';

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

export function createPalette(id) {
  const palette = palettes[id];
  if (palette) {
    logger.info(`Creating "${id}" palette`);
    return readPalette(palette);
  }
  throw new Error(`Unknown palette "${id}"`);
}

function readPalette(base64) {
  const data = decodeBase64(base64);
  const colors = new Uint32Array(64);
  const length = Math.min(data.length / 3, colors.length);
  for (let i = 0; i < length; i++) {
    const r = data.charCodeAt(3 * i);
    const g = data.charCodeAt(3 * i + 1);
    const b = data.charCodeAt(3 * i + 2);
    colors[i] = r | g << 8 | b << 16;
  }
  return colors;
}

function decodeBase64(input) {
  if (typeof atob === 'function') {
    return atob(input); // eslint-disable-line no-undef
  } else if (typeof Buffer === 'function') {
    return new Buffer(input, 'base64').toString('binary');
  }
  throw new Error('Unable to decode base64 string');
}
