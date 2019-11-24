import {log, decodeBase64, describe} from '../../common';
import {packColor, unpackColor} from '../colors';

import asqRealA from './asqRealA';
import asqRealB from './asqRealB';
import bmfFinR2 from './bmfFinR2';
import bmfFinR3 from './bmfFinR3';
import fceu13 from './fceu13';
import fceu15 from './fceu15';
import fceux from './fceux';
import nestopiaRgb from './nestopiaRgb';
import nestopiaYuv from './nestopiaYuv';
import sonyCxa2025as from './sonyCxa2025as';
import unsaturatedV6 from './unsaturatedV6';

const PALETTE_LENGTH = 64;

const palettes = {
  'asq-real-a': asqRealA,
  'asq-real-b': asqRealB,
  'bmf-fin-r2': bmfFinR2,
  'bmf-fin-r3': bmfFinR3,
  'fceu-13': fceu13,
  'fceu-15': fceu15,
  'fceux': fceux,
  'nestopia-rgb': nestopiaRgb,
  'nestopia-yuv': nestopiaYuv,
  'sony-cxa2025as': sonyCxa2025as,
  'unsaturated-v6': unsaturatedV6,
};

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
