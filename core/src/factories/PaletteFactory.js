// jscs:disable disallowQuotedKeysInObjects, requireCamelCaseOrUpperCaseIdentifiers

import asq_real_a from '../palettes/asq_real_a';
import asq_real_b from '../palettes/asq_real_b';
import bmf_fin_r2 from '../palettes/bmf_fin_r2';
import bmf_fin_r3 from '../palettes/bmf_fin_r3';
import fceu_13 from '../palettes/fceu_13';
import fceu_15 from '../palettes/fceu_15';
import fceux from '../palettes/fceux';
import nestopia_rgb from '../palettes/nestopia_rgb';
import nestopia_yuv from '../palettes/nestopia_yuv';
import logger from '../utils/logger';
import { base64ToData } from '../utils/convert';

const FALLBACK = 'fceux';

var palettes = {
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

//=========================================================
// Factory for palette creation
//=========================================================

export default class PaletteFactory {

  createPalette(id) {
    var palette = palettes[id];
    if (palette) {
      logger.info(`Creating "${id}" palette`);
      return this.readPalette(palette);
    }
    logger.warn(`Unsupported palette "${id}", using "${FALLBACK}" palette as fallback`);
    return this.readPalette(palettes[FALLBACK]);
  }

  readPalette(base64) {
    var data = base64ToData(base64);
    var colors = new Uint32Array(64);
    var length = Math.min(data.length / 3, colors.length);
    for (var i = 0; i < colors.length; i++) {
      var r = data[3 * i];
      var g = data[3 * i + 1];
      var b = data[3 * i + 2];
      colors[i] = r | g << 8 | b << 16;
    }
    return colors;
  }

}
