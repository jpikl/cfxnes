//=========================================================
// PPU cycle flags
//=========================================================

// http://wiki.nesdev.com/w/images/d/d1/Ntsc_timing.png

export const Flag = {
  RENDER: 1 << 1,     // Rendering cycle
  FETCH_NT: 1 << 2,   // Cycle where nametable byte is fetched
  FETCH_AT: 1 << 3,   // Cycle where attribute byte is fetched
  FETCH_BGL: 1 << 4,  // Cycle where low background byte is fetched
  FETCH_BGH: 1 << 5,  // Cycle where high background byte is fetched
  FETCH_SPL: 1 << 6,  // Cycle where low sprite byte is fetched
  FETCH_SPH: 1 << 7,  // Cycle where high sprite byte is fetched
  COPY_BG: 1 << 8,    // Cycle where background buffers are copied
  SHIFT_BG: 1 << 9,   // Cycle where background buffers are shifted
  EVAL_SP: 1 << 10,   // Cycle where sprites for next line are being evaluated
  CLIP_LEFT: 1 << 11, // Cycle where 8 left pixels are clipped
  CLIP_TB: 1 << 12,   // Cycle where 8 top/bottom pixels are clipped
  INC_CX: 1 << 13,    // Cycle where coarse X scroll is incremented
  INC_FY: 1 << 14,    // Cycle where fine Y scroll is incremented
  COPY_HS: 1 << 15,   // Cycle where horizontal scroll bits are copied
  COPY_VS: 1 << 16,   // Cycle where vertical scroll bits are copied
  VB_START: 1 << 17,  // Cycle where VBlank starts
  VB_START2: 1 << 18, // Cycle where VBlank starts and the 2 following cycles
  VB_END: 1 << 19,    // Cycle where VBlank ends
  SKIP: 1 << 20,      // Cycle which is skipped during odd frames
};

//=========================================================
// Scanline table
//=========================================================

const scanlineFlags = new Uint32Array(262);

for (let i = 0; i < scanlineFlags.length; i++) {
  if (i <= 239) {
    scanlineFlags[i] |= Flag.RENDER;
    scanlineFlags[i] |= Flag.SHIFT_BG;
    scanlineFlags[i] |= Flag.CLIP_LEFT;
    scanlineFlags[i] |= Flag.EVAL_SP;
  }
  if (i <= 239 || i === 261) {
    scanlineFlags[i] |= Flag.FETCH_NT;
    scanlineFlags[i] |= Flag.FETCH_AT;
    scanlineFlags[i] |= Flag.FETCH_BGL;
    scanlineFlags[i] |= Flag.FETCH_BGH;
    scanlineFlags[i] |= Flag.FETCH_SPL;
    scanlineFlags[i] |= Flag.FETCH_SPH;
    scanlineFlags[i] |= Flag.COPY_BG;
    scanlineFlags[i] |= Flag.INC_CX;
    scanlineFlags[i] |= Flag.INC_FY;
    scanlineFlags[i] |= Flag.COPY_HS;
  }
  if (i <= 7 || (i >= 232 && i <= 239)) {
    scanlineFlags[i] |= Flag.CLIP_TB;
  }
}

scanlineFlags[241] |= Flag.VB_START;
scanlineFlags[241] |= Flag.VB_START2;
scanlineFlags[261] |= Flag.COPY_VS;
scanlineFlags[261] |= Flag.VB_END;
scanlineFlags[261] |= Flag.SKIP;

//=========================================================
// Cycle table
//=========================================================

const cycleFlags = new Uint32Array(341);

for (let i = 0; i < cycleFlags.length; i++) {
  if (i >= 1 && i <= 256) {
    cycleFlags[i] |= Flag.RENDER;
    cycleFlags[i] |= Flag.CLIP_TB;
  }
  if ((i & 0x7) === 1 || i === 339) {
    cycleFlags[i] |= Flag.FETCH_NT;
  }
  if ((i & 0x7) === 3 && i !== 339) {
    cycleFlags[i] |= Flag.FETCH_AT;
  }
  if ((i & 0x7) === 5) {
    cycleFlags[i] |= (i <= 256 || i >= 321) ? Flag.FETCH_BGL : Flag.FETCH_SPL;
  }
  if ((i & 0x7) === 7) {
    cycleFlags[i] |= (i <= 256 || i >= 321) ? Flag.FETCH_BGH : Flag.FETCH_SPH;
  }
  if (((i & 0x7) === 0 && i >= 8 && i <= 256) || i === 328 || i === 336) {
    cycleFlags[i] |= Flag.INC_CX;
  }
  if (((i & 0x7) === 1 && i >= 9 && i <= 257) || i === 329 || i === 337) {
    cycleFlags[i] |= Flag.COPY_BG;
  }
  if ((i >= 1 && i <= 256) || (i >= 321 && i <= 336)) {
    cycleFlags[i] |= Flag.SHIFT_BG;
  }
  if (i >= 280 && i <= 304) {
    cycleFlags[i] |= Flag.COPY_VS;
  }
  if (i >= 1 && i <= 8) {
    cycleFlags[i] |= Flag.CLIP_LEFT;
  }
  if (i >= 1 && i <= 3) {
    cycleFlags[i] |= Flag.VB_START2;
  }
}

cycleFlags[1] |= Flag.VB_START;
cycleFlags[1] |= Flag.VB_END;
cycleFlags[65] |= Flag.EVAL_SP;
cycleFlags[256] |= Flag.INC_FY;
cycleFlags[257] |= Flag.COPY_HS;
cycleFlags[338] |= Flag.SKIP;

//=========================================================
// Detection
//=========================================================

export function getCycleFlags(scanline, cycle) {
  return scanlineFlags[scanline] & cycleFlags[cycle];
}
