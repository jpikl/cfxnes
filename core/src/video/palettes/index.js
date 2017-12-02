/* eslint-disable camelcase */

import {log, decodeBase64, describe} from '../../common';
import {packColor, unpackColor} from '../colors';

import asq_real_a from './asq_real_a';
import asq_real_b from './asq_real_b';
import bmf_fin_r2 from './bmf_fin_r2';
import bmf_fin_r3 from './bmf_fin_r3';
import fceu_13 from './fceu_13';
import fceu_15 from './fceu_15';
import fceux from './fceux';
import nestopia_rgb from './nestopia_rgb';
import nestopia_yuv from './nestopia_yuv';
import sony_cxa2025as from './sony_cxa2025as';
import unsaturated_v6 from './unsaturated_v6';

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
  'sony-cxa2025as': sony_cxa2025as,
  'unsaturated-v6': unsaturated_v6,
};

/* eslint-enable camelcase */

export const DEFAULT_PALETTE = 'fceux';

export function isPaletteName(name) {
  return name in palettes;
}

export function createPalette(name = DEFAULT_PALETTE) {
  const base64 = palettes[name];
  if (base64) {
    log.info(`Creating "${name}" palette`);
    return decodePalette(base64);
  }
  throw new Error('Invalid palette: ' + describe(name));
}

function decodePalette(base64) {
  const data = decodeBase64(base64);
  if (data.length !== PALETTE_LENGTH * 3) {
    throw new Error(`Palette data does not contain ${PALETTE_LENGTH} entries`);
  }
  const palette = new Uint32Array(PALETTE_LENGTH);
  for (let i = 0; i < PALETTE_LENGTH; i++) {
    const pos = 3 * i;
    const r = data.charCodeAt(pos);
    const g = data.charCodeAt(pos + 1);
    const b = data.charCodeAt(pos + 2);
    palette[i] = packColor(r, g, b);
  }
  return palette;
}

export function createPaletteVariant(palette, rRatio, gRatio, bRatio) {
  log.info(`Creating palette variant (${rRatio}, ${gRatio}, ${bRatio})`);
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
