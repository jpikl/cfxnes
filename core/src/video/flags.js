//=========================================================
// PPU cycle flags
//=========================================================

// http://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png

export const RENDER = 1 << 1;     // Rendering cycle
export const FETCH_NT = 1 << 2;   // Cycle where nametable byte is fetched
export const FETCH_AT = 1 << 3;   // Cycle where attribute byte is fetched
export const FETCH_BGL = 1 << 4;  // Cycle where low background byte is fetched
export const FETCH_BGH = 1 << 5;  // Cycle where high background byte is fetched
export const FETCH_SPL = 1 << 6;  // Cycle where low sprite byte is fetched
export const FETCH_SPH = 1 << 7;  // Cycle where high sprite byte is fetched
export const COPY_BG = 1 << 8;    // Cycle where background buffers are copied
export const SHIFT_BG = 1 << 9;   // Cycle where background buffers are shifted
export const EVAL_SP = 1 << 10;   // Cycle where sprites for next line are being evaluated
export const CLIP_LEFT = 1 << 11; // Cycle where 8 left pixels are clipped
export const CLIP_TB = 1 << 12;   // Cycle where 8 top/bottom pixels are clipped
export const INC_CX = 1 << 13;    // Cycle where coarse X scroll is incremented
export const INC_FY = 1 << 14;    // Cycle where fine Y scroll is incremented
export const COPY_HS = 1 << 15;   // Cycle where horizontal scroll bits are copied
export const COPY_VS = 1 << 16;   // Cycle where vertical scroll bits are copied
export const VB_START = 1 << 17;  // Cycle where VBlank starts
export const VB_START2 = 1 << 18; // Cycle where VBlank starts and the 2 following cycles
export const VB_END = 1 << 19;    // Cycle where VBlank ends
export const SKIP = 1 << 20;      // Cycle which is skipped during odd frames

//=========================================================
// Scanline table
//=========================================================

const scanlines = new Uint32Array(262);

for (let i = 0; i < scanlines.length; i++) {
  if (i <= 239) {
    scanlines[i] |= RENDER;
    scanlines[i] |= SHIFT_BG;
    scanlines[i] |= CLIP_LEFT;
    scanlines[i] |= EVAL_SP;
  }
  if (i <= 239 || i === 261) {
    scanlines[i] |= FETCH_NT;
    scanlines[i] |= FETCH_AT;
    scanlines[i] |= FETCH_BGL;
    scanlines[i] |= FETCH_BGH;
    scanlines[i] |= FETCH_SPL;
    scanlines[i] |= FETCH_SPH;
    scanlines[i] |= COPY_BG;
    scanlines[i] |= INC_CX;
    scanlines[i] |= INC_FY;
    scanlines[i] |= COPY_HS;
  }
  if (i <= 7 || (i >= 232 && i <= 239)) {
    scanlines[i] |= CLIP_TB;
  }
}

scanlines[241] |= VB_START;
scanlines[241] |= VB_START2;
scanlines[261] |= COPY_VS;
scanlines[261] |= VB_END;
scanlines[261] |= SKIP;

//=========================================================
// Cycle table
//=========================================================

const cycles = new Uint32Array(341);

for (let i = 0; i < cycles.length; i++) {
  if (i >= 1 && i <= 256) {
    cycles[i] |= RENDER;
    cycles[i] |= CLIP_TB;
  }
  if ((i & 0x7) === 1 || i === 339) {
    cycles[i] |= FETCH_NT;
  }
  if ((i & 0x7) === 3 && i !== 339) {
    cycles[i] |= FETCH_AT;
  }
  if ((i & 0x7) === 5) {
    cycles[i] |= (i <= 256 || i >= 321) ? FETCH_BGL : FETCH_SPL;
  }
  if ((i & 0x7) === 7) {
    cycles[i] |= (i <= 256 || i >= 321) ? FETCH_BGH : FETCH_SPH;
  }
  if (((i & 0x7) === 0 && i >= 8 && i <= 256) || i === 328 || i === 336) {
    cycles[i] |= INC_CX;
  }
  if (((i & 0x7) === 1 && i >= 9 && i <= 257) || i === 329 || i === 337) {
    cycles[i] |= COPY_BG;
  }
  if ((i >= 1 && i <= 256) || (i >= 321 && i <= 336)) {
    cycles[i] |= SHIFT_BG;
  }
  if (i >= 280 && i <= 304) {
    cycles[i] |= COPY_VS;
  }
  if (i >= 1 && i <= 8) {
    cycles[i] |= CLIP_LEFT;
  }
  if (i >= 1 && i <= 3) {
    cycles[i] |= VB_START2;
  }
}

cycles[1] |= VB_START;
cycles[1] |= VB_END;
cycles[65] |= EVAL_SP;
cycles[256] |= INC_FY;
cycles[257] |= COPY_HS;
cycles[338] |= SKIP;

//=========================================================
// Computation
//=========================================================

export function compute(scanline, cycle) {
  return scanlines[scanline] & cycles[cycle];
}
