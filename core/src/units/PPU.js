import {BLACK_COLOR, VIDEO_WIDTH, NMI} from '../constants';
import {packColor, unpackColor} from '../utils';
import log from '../log';

//=========================================================
// PPU cycle/scanlines flags
//=========================================================

const F_RENDER = 1 << 1;     // Rendering cycle
const F_FETCH_NT = 1 << 2;   // Cycle where nametable byte is fetched
const F_FETCH_AT = 1 << 3;   // Cycle where attribute byte is fetched
const F_FETCH_BGL = 1 << 4;  // Cycle where low background byte is fetched
const F_FETCH_BGH = 1 << 5;  // Cycle where high background byte is fetched
const F_FETCH_SPL = 1 << 6;  // Cycle where low sprite byte is fetched
const F_FETCH_SPH = 1 << 7;  // Cycle where high sprite byte is fetched
const F_COPY_BG = 1 << 8;    // Cycle where background buffers are copied
const F_SHIFT_BG = 1 << 9;   // Cycle where background buffers are shifted
const F_EVAL_SP = 1 << 10;   // Cycle where sprites for next line are being evaluated
const F_CLIP_LEFT = 1 << 11; // Cycle where 8 left pixels are clipped
const F_CLIP_TB = 1 << 12;   // Cycle where 8 top/bottom pixels are clipped
const F_INC_CX = 1 << 13;    // Cycle where coarse X scroll is incremented
const F_INC_FY = 1 << 14;    // Cycle where fine Y scroll is incremented
const F_COPY_HS = 1 << 15;   // Cycle where horizontal scroll bits are copied
const F_COPY_VS = 1 << 16;   // Cycle where vertical scroll bits are copied
const F_VB_START = 1 << 17;  // Cycle where VBlank starts
const F_VB_START2 = 1 << 18; // Cycle where VBlank starts and the 2 following cycles
const F_VB_END = 1 << 19;    // Cycle where VBlank ends
const F_SKIP = 1 << 20;      // Cycle which is skipped during odd frames

//=========================================================
// Cycle flags table
//=========================================================

const cycleFlags = new Uint32Array(341);

for (let i = 0; i < cycleFlags.length; i++) {
  if (i >= 1 && i <= 256) {
    cycleFlags[i] |= F_RENDER;
    cycleFlags[i] |= F_CLIP_TB;
  }
  if ((i & 0x7) === 1 || i === 339) {
    cycleFlags[i] |= F_FETCH_NT;
  }
  if ((i & 0x7) === 3 && i !== 339) {
    cycleFlags[i] |= F_FETCH_AT;
  }
  if ((i & 0x7) === 5) {
    cycleFlags[i] |= (i <= 256 || i >= 321) ? F_FETCH_BGL : F_FETCH_SPL;
  }
  if ((i & 0x7) === 7) {
    cycleFlags[i] |= (i <= 256 || i >= 321) ? F_FETCH_BGH : F_FETCH_SPH;
  }
  if ((i & 0x7) === 0 && i >= 8 && i <= 256 || i === 328 || i === 336) {
    cycleFlags[i] |= F_INC_CX;
  }
  if ((i & 0x7) === 1 && i >= 9 && i <= 257 || i === 329 || i === 337) {
    cycleFlags[i] |= F_COPY_BG;
  }
  if ((i >= 1 && i <= 256) || (i >= 321 && i <= 336)) {
    cycleFlags[i] |= F_SHIFT_BG;
  }
  if (i >= 280 && i <= 304) {
    cycleFlags[i] |= F_COPY_VS;
  }
  if (i >= 1 && i <= 8) {
    cycleFlags[i] |= F_CLIP_LEFT;
  }
  if (i >= 1 && i <= 3) {
    cycleFlags[i] |= F_VB_START2;
  }
}

cycleFlags[1] |= F_VB_START;
cycleFlags[1] |= F_VB_END;
cycleFlags[65] |= F_EVAL_SP;
cycleFlags[256] |= F_INC_FY;
cycleFlags[257] |= F_COPY_HS;
cycleFlags[338] |= F_SKIP;

//=========================================================
// Scanline flags table
//=========================================================

const scanlineFlags = new Uint32Array(262);

for (let i = 0; i < scanlineFlags.length; i++) {
  if (i <= 239) {
    scanlineFlags[i] |= F_RENDER;
    scanlineFlags[i] |= F_SHIFT_BG;
    scanlineFlags[i] |= F_CLIP_LEFT;
    scanlineFlags[i] |= F_EVAL_SP;
  }
  if (i <= 239 || i === 261) {
    scanlineFlags[i] |= F_FETCH_NT;
    scanlineFlags[i] |= F_FETCH_AT;
    scanlineFlags[i] |= F_FETCH_BGL;
    scanlineFlags[i] |= F_FETCH_BGH;
    scanlineFlags[i] |= F_FETCH_SPL;
    scanlineFlags[i] |= F_FETCH_SPH;
    scanlineFlags[i] |= F_COPY_BG;
    scanlineFlags[i] |= F_INC_CX;
    scanlineFlags[i] |= F_INC_FY;
    scanlineFlags[i] |= F_COPY_HS;
  }
  if (i <= 7 || (i >= 232 && i <= 239)) {
    scanlineFlags[i] |= F_CLIP_TB;
  }
}

scanlineFlags[241] |= F_VB_START;
scanlineFlags[241] |= F_VB_START2;
scanlineFlags[261] |= F_COPY_VS;
scanlineFlags[261] |= F_VB_END;
scanlineFlags[261] |= F_SKIP;

//=========================================================
// Sprite data for curently rendered scanline
//=========================================================

class Sprite {

  constructor() {
    this.x = 0;                  // X position on scanline
    this.zeroSprite = false;     // Whether this is a first sprite from OAM
    this.horizontalFlip = false; // Whether is flipped horizontally
    this.paletteNumber = 0;      // Palette number for rendering
    this.inFront = false;        // Rendering priority
    this.patternRowAddress = 0;  // Base address of sprite pattern row
    this.patternRow0 = 0;        // Pattern row (bit 0)
    this.patternRow1 = 0;        // Pattern row (bit 1)
  }

}

//=========================================================
// Picture processing unit
//=========================================================

export default class PPU {

  constructor() {
    this.colorEmphasis = 0; // Color palette BGR emphasis bits
  }

  connect(nes) {
    this.cpu = nes.cpu;
    this.ppuMemory = nes.ppuMemory;
  }

  //=========================================================
  // Power-up state initialization
  //=========================================================

  powerUp() {
    log.info('Reseting PPU');
    this.resetOAM();
    this.resetRegisters();
    this.resetVariables();
  }

  resetOAM() {
    this.primaryOAM = new Uint8Array(0x100); // Sprite data - 256B (64 x 4B sprites)
    this.secondaryOAM = new Array(8);      // Sprite data for rendered scanline (up to 8 sprites)
    for (let i = 0; i < this.secondaryOAM.length; i++) {
      this.secondaryOAM[i] = new Sprite;
    }
  }

  resetRegisters() {
    this.setControl(0);          //  8-bit PPUCTRL register
    this.setMask(0);             //  8-bit PPUMASK register
    this.setStatus(0);           //  8-bit PPUSTATUS register
    this.oamAddress = 0;         // 15-bit OAMADDR register
    this.tempAddress = 0;        // 15-bit 'Loopy T' register
    this.vramAddress = 0;        // 15-bit 'Loopy V' register
    this.vramReadBuffer = 0;     //  8-bit VRAM read buffer
    this.writeToogle = 0;        //  1-bit 'Loopy W' register
    this.fineXScroll = 0;        //  3-bit 'Loopy X' register
    this.patternBuffer0 = 0;     // 16-bit pattern (bit 0) shift buffer
    this.patternBuffer1 = 0;     // 16-bit pattern (bit 1) shift buffer
    this.paletteBuffer0 = 0;     //  8-bit palette (bit 0) shift buffer
    this.paletteBuffer1 = 0;     //  8-bit palette (bit 1) shift buffer
    this.paletteLatch0 = 0;      //  1-bit palette (bit 0) latch register
    this.paletteLatch1 = 0;      //  1-bit palette (bit 1) latch register
    this.patternBufferNext0 = 0; // Next value for pattern (bit 0) shift buffer
    this.patternBufferNext1 = 0; // Next value for pattern (bit 1) shift buffer
    this.paletteLatchNext0 = 0;  // Next value for palette (bit 0) latch register
    this.paletteLatchNext1 = 0;  // Next value for palette (bit 1) latch register
  }

  resetVariables() {
    this.scanline = 261;           // Current scanline - from total 262 scanlines (0..261)
    this.cycle = 0;                // Current cycle - from total 341 cycles per scanline (0..340)
    this.csFlags = 0;              // Flags for current cycle/scanline
    this.vblankSuppressed = false; // Whether to suppress VBlank flag setting
    this.nmiSuppressed = false;    // Whether to supress NMI generation
    this.nmiDelay = 0;             // Number of cycles after which NMI is generated
    this.oddFrame = false;         // Whether odd frame is being rendered
    this.spriteCount = 0;          // Total number of sprites on current scanline
    this.spriteNumber = 0;         // Number of currently fetched sprite
    this.spriteCache = new Array(261);         // Preprocessed sprite data for current scanline (cycle -> sprite rendered on this cycle)
    this.spritePixelCache = new Uint8Array(261); // Prerendered sprite pixels for current scanline (cycle -> sprite pixel rendered on this cycle)
  }

  //=========================================================
  // Configuration
  //=========================================================

  setRegionParams(params) {
    this.clipTopBottom = params.ppuClipTopBottom;
  }

  setPalette(palette) {
    this.createPaletteVariants(palette);
    this.updatePalette();
  }

  //=========================================================
  // Color palette generation
  //=========================================================

  createPaletteVariants(basePalette) {
    this.paletteVariants = new Array(8); // Palette for each combination of colors emphasis bits: BGR
    for (let colorEmphasis = 0; colorEmphasis < this.paletteVariants.length; colorEmphasis++) {
      const rRatio = colorEmphasis & 6 ? 0.75 : 1.0; // Dim red when green or blue is emphasized
      const gRatio = colorEmphasis & 5 ? 0.75 : 1.0; // Dim green when red or blue is emphasized
      const bRatio = colorEmphasis & 3 ? 0.75 : 1.0; // Dim blue when red or green is emphasized
      this.paletteVariants[colorEmphasis] = this.createPaletteVariant(basePalette, rRatio, gRatio, bRatio);
    }
  }

  createPaletteVariant(basePalette, rRatio, gRatio, bRatio) {
    const paletteVariant = new Uint32Array(basePalette.length);
    for (let i = 0; i < basePalette.length; i++) {
      const rgb = basePalette[i];
      const r = Math.floor(rRatio * (rgb & 0xFF));
      const g = Math.floor(gRatio * ((rgb >>> 8) & 0xFF));
      const b = Math.floor(bRatio * ((rgb >>> 16) & 0xFF));
      paletteVariant[i] = packColor(r, g, b);
    }
    return paletteVariant;
  }

  updatePalette() {
    this.palette = this.paletteVariants[this.colorEmphasis];
  }

  //=========================================================
  // Control register ($2000 - PPUCTRL)
  //=========================================================

  writeControl(value) {
    const nmiEnabledOld = this.nmiEnabled;
    this.setControl(value);
    this.tempAddress = (this.tempAddress & 0xF3FF) | (value & 0x03) << 10; // T[11,10] = C[1,0]
    if (this.vblankFlag && !nmiEnabledOld && this.nmiEnabled && !(this.csFlags & F_VB_END)) {
      this.nmiDelay = 1; // Generate NMI after next instruction when its enabled (from 0 to 1) during VBlank
    }
  }

  setControl(value) {
    this.bigAddressIncrement = (value >>> 2) & 1;       // C[2] VRAM address increment per CPU read/write of PPUDATA (1 / 32)
    this.spPatternTableAddress = (value << 9) & 0x1000; // C[3] Sprite pattern table address for 8x8 sprites ($0000 / $1000)
    this.bgPatternTableAddress = (value << 8) & 0x1000; // C[4] Background pattern table address-($0000 / $1000)
    this.bigSprites = (value >>> 5) & 1;                // C[5] Sprite size (8x8 / 8x16)
    this.nmiEnabled = value >>> 7;                      // C[7] Whether NMI is generated at the start of the VBlank
  }

  //=========================================================
  // Mask register ($2001 - PPUMASK)
  //=========================================================

  writeMask(value) {
    this.setMask(value);
    this.updatePalette();
  }

  setMask(value) {
    this.monochromeMode = value & 1;                //  M[0]   Color / monochrome mode switch
    this.backgroundClipping = !((value >>> 1) & 1); // !M[1]   Whether to hide background in leftmost 8 pixels of screen
    this.spriteClipping = !((value >>> 2) & 1);     // !M[2]   Whether to hide sprites in leftmost 8 pixels of screen
    this.backgroundVisible = (value >>> 3) & 1;     //  M[3]   Whether background is visible
    this.spritesVisible = (value >>> 4) & 1;        //  M[4]   Whether sprites are visible
    this.colorEmphasis = (value >>> 5) & 7;         //  M[5-7] Color palette BGR emphasis bits
  }

  //=========================================================
  // Status register ($2002 - PPUSTATUS)
  //=========================================================

  readStatus() {
    const value = this.getStatus();
    this.vblankFlag = 0;  // Cleared by reading status
    this.writeToogle = 0; // Cleared by reading status
    if (this.csFlags & F_VB_START) {
      this.vblankSuppressed = true; // Reading just before VBlank disables VBlank flag setting
    }
    if (this.csFlags & F_VB_START2) {
      this.nmiSuppressed = true;    // Reading just before VBlank and 2 cycles after disables NMI generation
    }
    return value;
  }

  getStatus() {
    return this.spriteOverflow << 5  // S[5]
       | this.spriteZeroHit << 6     // S[6]
       | this.vblankFlag << 7;       // S[7]
  }

  setStatus(value) {
    this.spriteOverflow = (value >>> 5) & 1; // S[5]
    this.spriteZeroHit = (value >>> 6) & 1;  // S[6]
    this.vblankFlag = value >>> 7;           // S[7]
  }

  //=========================================================
  // OAM access ($2003 - OAMADDR / $2004 - OAMDATA)
  //=========================================================

  writeOAMAddress(address) {
    this.oamAddress = address;
  }

  readOAMData() {
    let value = this.primaryOAM[this.oamAddress]; // Read does not increment the address
    if ((this.oamAddress & 0x03) === 2) {
      value &= 0xE3; // Clear bits 2-4 when reading byte 2 of a sprite (these bits are not stored in OAM)
    }
    return value;
  }

  writeOAMData(value) {
    if (!this.isRenderingActive()) {
      this.primaryOAM[this.oamAddress] = value;   // Disabled during rendering
    }
    this.oamAddress = (this.oamAddress + 1) & 0xFF; // Write always increments the address
  }

  //=========================================================
  // VRAM access ($2006 - PPUADDR / $2007 - PPUDATA)
  //=========================================================

  writeAddress(address) {
    this.writeToogle = !this.writeToogle;
    if (this.writeToogle) {
      const addressHigh = (address & 0x3F) << 8;
      this.tempAddress = (this.tempAddress & 0x00FF) | addressHigh; // High bits [13-8] (bit 14 is cleared)
    } else {
      const addressLow = address;
      this.tempAddress = (this.tempAddress & 0xFF00) | addressLow;  // Low bits  [7-0]
      this.vramAddress = this.tempAddress;
    }
  }

  readData() {
    if ((this.vramAddress & 0x3F00) === 0x3F00) {
      const value = this.ppuMemory.read(this.vramAddress); // Immediate read inside the palette memory area
      this.vramReadBuffer = this.ppuMemory.read(this.vramAddress & 0x2FFF); //  Buffer musn't be reloaded from palette address, but from underlying nametable address
      this.incrementAddress();
      return value;
    }
    const value = this.vramReadBuffer; // Delayed read outside the palette memory area (values are passed through read buffer first)
    this.vramReadBuffer = this.ppuMemory.read(this.vramAddress);
    this.incrementAddress();
    return value;
  }

  writeData(value) {
    if (!this.isRenderingActive()) {
      this.ppuMemory.write(this.vramAddress, value); // Disabled during rendering
    }
    this.incrementAddress();
  }

  incrementAddress() {
    const increment = this.bigAddressIncrement ? 0x20 : 0x01; // Vertical/horizontal move in pattern table
    this.vramAddress = (this.vramAddress + increment) & 0xFFFF;
  }

  //=========================================================
  // Scrolling and scrolling register ($2005 - PPUSCROLL)
  //=========================================================

  // The position of currently rendered pattern and its pixel is stored in
  // VRAM address register with following structure: 0yyy.NNYY.YYYX.XXXX.
  //     yyy = fine Y scroll (y pixel position within pattern)
  //      NN = index of active name table (where pattern numbers are stored)
  //   YYYYY = coarse Y scroll (y position of pattern number in name table)
  //   XXXXX = coarse X scroll (x position of pattern number in name table)
  // Fine X scroll (x pixel position within pattern) has its own register.

  writeScroll(value) {
    this.writeToogle = !this.writeToogle;
    if (this.writeToogle) { // 1st write (X scroll)
      this.fineXScroll = value & 0x07;
      const coarseXScroll = value >>> 3;
      this.tempAddress = (this.tempAddress & 0xFFE0) | coarseXScroll;
    } else {                // 2nd write (Y scroll)
      const fineYScroll = (value & 0x07) << 12;
      const coarseYScroll = (value & 0xF8) << 2;
      this.tempAddress = (this.tempAddress & 0x0C1F) | coarseYScroll | fineYScroll;
    }
  }

  updateScrolling() {
    if (this.csFlags & F_INC_CX) {
      this.incrementCoarseXScroll();
    }
    if (this.csFlags & F_INC_FY) {
      this.incrementFineYScroll();
    }
    if (this.csFlags & F_COPY_HS) {
      this.copyHorizontalScrollBits();
    }
    if (this.csFlags & F_COPY_VS) {
      this.copyVerticalScrollBits();
    }
  }

  copyHorizontalScrollBits() {
    this.vramAddress = (this.vramAddress & 0x7BE0) | (this.tempAddress & 0x041F); // V[10,4-0] = T[10,4-0]
  }

  copyVerticalScrollBits() {
    this.vramAddress = (this.vramAddress & 0x041F) | (this.tempAddress & 0x7BE0); // V[14-11,9-5] = T[14-11,9-5]
  }

  incrementCoarseXScroll() {
    if ((this.vramAddress & 0x001F) === 0x001F) { // if (coarseScrollX === 31) {
      this.vramAddress &= 0xFFE0;                 //     coarseScrollX = 0;
      this.vramAddress ^= 0x0400;                 //     nameTableBit0 = !nameTableBit0;
    } else {                                      // } else {
      this.vramAddress += 0x0001;                 //     coarseScrollX++;
    }                                             // }
  }

  incrementFineYScroll() {
    if ((this.vramAddress & 0x7000) === 0x7000) { // if (fineScrollY === 7) {
      this.vramAddress &= 0x0FFF;                 //     fineScrollY = 0;
      this.incrementCoarseYScroll();              //     incrementCoarseYScroll();
    } else {                                      // } else {
      this.vramAddress += 0x1000;                 //     fineScrollY++;
    }                                             // }
  }

  incrementCoarseYScroll() {
    if ((this.vramAddress & 0x03E0) === 0x03E0) {        // if (coarseScrollY === 31) {
      this.vramAddress &= 0xFC1F;                        //     coarseScrollY = 0;
    } else if ((this.vramAddress & 0x03E0) === 0x03A0) { // } else if (coarseScrollY === 29) {
      this.vramAddress &= 0xFC1F;                        //     coarseScrollY = 0;
      this.vramAddress ^= 0x0800;                        //     nameTableBit1 = !nameTableBit1;
    } else {                                             // } else {
      this.vramAddress += 0x0020;                        //     coarseScrollY++;
    }                                                    // }
  }

  //=========================================================
  // Frame buffer access
  //=========================================================

  setFrameBuffer(buffer) {
    this.frameBuffer = buffer;
    this.framePosition = 0;
    this.frameAvailable = false;
  }

  isFrameAvailable() {
    return this.frameAvailable;
  }

  isBrightFramePixel(x, y) {
    if (y < this.scanline - 5 || y >= this.scanline) {
      return false; // Screen luminance decreases in time
    }
    const [r, g, b] = unpackColor(this.frameBuffer[y * VIDEO_WIDTH + x]);
    return r > 0x12 || g > 0x12 || b > 0x12;
  }

  setFramePixel(color) {
    this.frameBuffer[this.framePosition++] = this.palette[color & 0x3F]; // Only 64 colors
  }

  setFramePixelOnPosition(x, y, color) {
    this.frameBuffer[y * VIDEO_WIDTH + x] = this.palette[color & 0x3F]; // Only 64 colors
  }

  clearFramePixel() {
    this.frameBuffer[this.framePosition++] = BLACK_COLOR;
  }

  //=========================================================
  // VBlank detection / NMI generation
  //=========================================================

  updateVBlank() {
    if (this.nmiDelay) {
      if (!this.nmiEnabled) {
        this.nmiDelay = 0; // NMI disabled near the time VBlank flag is set
      } else if (!--this.nmiDelay && !this.nmiSuppressed) {
        this.cpu.activateInterrupt(NMI); // Delay decremented to zero
      }
    }
    if (this.csFlags & F_VB_START) {
      this.enterVBlank();
    } else if (this.csFlags & F_VB_END) {
      this.leaveVBlank();
    }
  }

  enterVBlank() {
    this.vblankActive = true;
    if (!this.vblankSuppressed) {
      this.vblankFlag = 1;
    }
    this.nmiDelay = 2;
    this.frameAvailable = true;
  }

  leaveVBlank() {
    this.vblankActive = false;
    this.vblankFlag = 0;
    this.vblankSuppressed = false;
    this.nmiSuppressed = false;
    this.spriteZeroHit = 0;
    this.spriteOverflow = 0;
  }

  //=========================================================
  // Scanline / cycle update
  //=========================================================

  incrementCycle() {
    if ((this.csFlags & F_SKIP) && this.oddFrame && this.isRenderingEnabled()) {
      this.cycle++; // One cycle skipped on odd frames
    }
    this.cycle++;
    if (this.cycle > 340) {
      this.incrementScanline();
    }
    this.csFlags = cycleFlags[this.cycle] & scanlineFlags[this.scanline]; // Update flags for the new scanline/cycle
  }

  incrementScanline() {
    this.cycle = 0;
    this.scanline++;
    if (this.scanline > 261) {
      this.incrementFrame();
    }
    if (this.scanline <= 239) {
      this.clearSprites();
      if (this.scanline > 0) {
        this.prerenderSprites(); // Sprites are not rendered on scanline 0
      }
    }
  }

  incrementFrame() {
    this.scanline = 0;
    this.oddFrame = !this.oddFrame;
    this.framePosition = 0;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (this.isRenderingEnabled()) {
      this.fetchData();
      this.doRendering();
      this.updateScrolling();
    } else {
      this.skipRendering();
      this.addressBus = this.vramAddress;
    }
    this.updateVBlank();
    this.incrementCycle();
  }

  fetchData() {
    if (this.csFlags & F_FETCH_NT) {
      this.fetchNametable();
    } else if (this.csFlags & F_FETCH_AT) {
      this.fetchAttribute();
    } else if (this.csFlags & F_FETCH_BGL) {
      this.fetchBackgroundLow();
    } else if (this.csFlags & F_FETCH_BGH) {
      this.fetchBackgroundHigh();
    } else if (this.csFlags & F_FETCH_SPL) {
      this.fetchSpriteLow();
    } else if (this.csFlags & F_FETCH_SPH) {
      this.fetchSpriteHigh();
    }
  }

  doRendering() {
    if (this.csFlags & F_EVAL_SP) {
      this.evaluateSprites();
    }
    if (this.csFlags & F_COPY_BG) {
      this.copyBackground();
    }
    if (this.csFlags & F_RENDER) {
      this.updateFramePixel();
    }
    if (this.csFlags & F_SHIFT_BG) {
      this.shiftBackground();
    }
  }

  skipRendering() {
    if (this.csFlags & F_RENDER) {
      this.clearFramePixel();
    }
  }

  isRenderingActive() {
    return !this.vblankActive && this.isRenderingEnabled();
  }

  isRenderingEnabled() {
    return this.spritesVisible || this.backgroundVisible;
  }

  //=========================================================
  // Rendering
  //=========================================================

  updateFramePixel() {
    const address = this.renderFramePixel();
    if (this.clipTopBottom && (this.csFlags & F_CLIP_TB)) {
      this.clearFramePixel();
    } else {
      const color = this.ppuMemory.readPalette(address);
      this.setFramePixel(color);
    }
  }

  renderFramePixel() {
    const backgroundColorAddress = this.renderBackgroundPixel();
    const spriteColorAddress = this.renderSpritePixel();
    if (backgroundColorAddress & 0x03) {
      if (spriteColorAddress & 0x03) {
        const sprite = this.getRenderedSprite();
        if (sprite.zeroSprite && this.cycle !== 256) { // Sprite zero hit does not happen for (x = 255)
          this.spriteZeroHit = 1;
        }
        if (sprite.inFront) {
          return spriteColorAddress;   // The sprite has priority over the background
        }
      }
      return backgroundColorAddress;   // Only the background is visible or it has priority over the sprite
    }
    if (spriteColorAddress & 0x03) {
      return spriteColorAddress;       // Only the sprite is visible
    }
    return 0;                          // Use backdrop color
  }

  //=========================================================
  // Background rendering
  //=========================================================

  // Colors are saved at addresses with structure 0111.1111.000S.PPCC.
  //    S = 0 for background, 1 for sprites
  //   PP = palette number
  //   CC = color number
  //
  // The position of currently rendered pattern and its pixel is stored in
  // VRAM address register with following structure: 0yyy.NNYY.YYYX.XXXX.
  //     yyy = fine Y scroll (y pixel position within pattern)
  //      NN = index of active name table (where pattern numbers are stored)
  //   YYYYY = coarse Y scroll (y position of pattern number in name table)
  //   XXXXX = coarse X scroll (x position of pattern number in name table)
  // Fine X scroll (x pixel position within pattern) has its own register.
  // Address of a pattern number can be constructed as 0010.NNYY.YYYX.XXXX.
  //
  // Pattern number is used as an offset into one of pattern tables at
  // 0x0000 and 0x1000, where patterns are stored. We can construct
  // this address as 00T.0000.PPPP.0000
  //      T = pattern table selection bit
  //   PPPP = pattern number
  //
  // Each pattern is 16B long and consits from two 8x8 matricies.
  // Each 8x8 matrix contains 1 bit of CC (color number) for pattern pixels.
  //
  // Palette numbers PP are defined for 2x2 tile areas. These numbers
  // are store as attributes in attribute tables. Each attribute (1B) contains
  // total 4 palette numbers for bigger 4x4 tile area as value 3322.1100
  //   00 = palette number for top left 2x2 area
  //   11 = palette number for top right 2x2 area
  //   22 = palette number for bottom left 2x2 area
  //   33 = palette number for bottom right 2x2 area
  // Address of an attribute can be constructed as 0010.NN11.11YY.YXXX
  //   YYY = 3 upper bits of YYYYY
  //   XXX = 3 upper bits of XXXXX
  // 2x2 area number can be constructed as YX
  //   Y = bit 1 of YYYYY
  //   X = bit 1 of XXXXX

  fetchNametable() {
    this.addressBus = 0x2000 | this.vramAddress & 0x0FFF;
    const patternNumer = this.ppuMemory.readNameAttr(this.addressBus); // Nametable byte fetch
    const patternAddress = this.bgPatternTableAddress + (patternNumer << 4);
    const fineYScroll = (this.vramAddress >>> 12) & 0x07;
    this.patternRowAddress = patternAddress + fineYScroll;
  }

  fetchAttribute() {
    const attributeTableAddress = 0x23C0 | this.vramAddress & 0x0C00;
    const attributeNumber = (this.vramAddress >>> 4) & 0x38 | (this.vramAddress >>> 2) & 0x07;
    this.addressBus = attributeTableAddress + attributeNumber;
    const attribute = this.ppuMemory.readNameAttr(this.addressBus); // Attribute byte fetch
    const areaNumber = (this.vramAddress >>> 4) & 0x04 | this.vramAddress & 0x02;
    const paletteNumber = (attribute >>> areaNumber) & 0x03;
    this.paletteLatchNext0 = paletteNumber & 1;
    this.paletteLatchNext1 = (paletteNumber >>> 1) & 1;
  }

  fetchBackgroundLow() {
    this.addressBus = this.patternRowAddress;
    this.patternBufferNext0 = this.ppuMemory.readPattern(this.addressBus); // Low background byte fetch
  }

  fetchBackgroundHigh() {
    this.addressBus = this.patternRowAddress + 8;
    this.patternBufferNext1 = this.ppuMemory.readPattern(this.addressBus); // High background byte fetch
  }

  copyBackground() {
    this.patternBuffer0 |= this.patternBufferNext0;
    this.patternBuffer1 |= this.patternBufferNext1;
    this.paletteLatch0 = this.paletteLatchNext0;
    this.paletteLatch1 = this.paletteLatchNext1;
  }

  shiftBackground() {
    this.patternBuffer0 = this.patternBuffer0 << 1;
    this.patternBuffer1 = this.patternBuffer1 << 1;
    this.paletteBuffer0 = (this.paletteBuffer0 << 1) | this.paletteLatch0;
    this.paletteBuffer1 = (this.paletteBuffer1 << 1) | this.paletteLatch1;
  }

  renderBackgroundPixel() {
    if (this.isBackgroundPixelVisible()) {
      const colorBit0 = ((this.patternBuffer0 << this.fineXScroll) >> 15) & 0x1;
      const colorBit1 = ((this.patternBuffer1 << this.fineXScroll) >> 14) & 0x2;
      const paletteBit0 = ((this.paletteBuffer0 << this.fineXScroll) >> 5) & 0x4;
      const paletteBit1 = ((this.paletteBuffer1 << this.fineXScroll) >> 4) & 0x8;
      return paletteBit1 | paletteBit0 | colorBit1 | colorBit0;
    }
    return 0;
  }

  isBackgroundPixelVisible() {
    return this.backgroundVisible && !(this.backgroundClipping && (this.csFlags & F_CLIP_LEFT));
  }

  //=========================================================
  // Sprite rendering
  //=========================================================

  // Before each scanline, the first 8 visible sprites on that scanline are fetched into
  // secondary OAM. Each sprite has 4B of data.
  //
  // Byte 0 - y screen coordinate (decremented by 1, because rendering of fetched sprites is delayed)
  // Byte 1 - pattern number PPPP.PPPT (if 8x16 sprites are enabled, bit T selects the pattern table,
  //          otherwise it is seleted by bit 4 of control register)
  // Byte 2 - attributes VHP0.00CC
  //   V = vertical mirroring enabled
  //   H = horizontal mirroring enabled
  //   P = sprite priority (0 - in front of background, 1 - behind background)
  //   C = color palette number
  // Byte 3 = x screen coordinate

  evaluateSprites() {
    this.spriteNumber = 0;
    this.spriteCount = 0;

    const height = this.bigSprites ? 16 : 8;
    const bottomY = this.scanline + 1;
    const topY = bottomY - height + 1;

    for (let address = 0; address < this.primaryOAM.length; address += 4) {
      const spriteY = this.primaryOAM[address] + 1;
      if (spriteY < topY || spriteY > bottomY) {
        continue;
      }

      if (this.spriteCount >= 8) {
        this.spriteOverflow = 1;
        break;
      }

      let patternTableAddress = this.spPatternTableAddress;
      let patternNumber = this.primaryOAM[address + 1];
      if (this.bigSprites) {
        patternTableAddress = (patternNumber & 1) << 12;
        patternNumber &= 0xFE;
      }

      const attributes = this.primaryOAM[address + 2];
      let rowNumber = bottomY - spriteY;
      if (attributes & 0x80) {
        rowNumber = height - rowNumber - 1; // Vertical flip
      }
      if (rowNumber >= 8) { // Overflow to the next (bottom) pattern
        rowNumber -= 8;
        patternNumber++;
      }

      const sprite = this.secondaryOAM[this.spriteCount];
      sprite.x = this.primaryOAM[address + 3];
      sprite.zeroSprite = address === 0;
      sprite.horizontalFlip = attributes & 0x40;
      sprite.paletteNumber = 0x10 | (attributes & 0x03) << 2;
      sprite.inFront = (attributes & 0x20) === 0;

      const patternAddress = patternTableAddress + (patternNumber << 4);
      sprite.patternRowAddress = patternAddress + rowNumber;
      this.spriteCount++;
    }
  }

  fetchSpriteLow() {
    if (this.spriteNumber < this.spriteCount) {
      const sprite = this.secondaryOAM[this.spriteNumber];
      this.addressBus = sprite.patternRowAddress;
      sprite.patternRow0 = this.ppuMemory.readPattern(this.addressBus);
    } else {
      this.addressBus = this.spPatternTableAddress | 0x0FF0; // Dummy fetch for tile $FF
    }
  }

  fetchSpriteHigh() {
    if (this.spriteNumber < this.spriteCount) {
      const sprite = this.secondaryOAM[this.spriteNumber++];
      this.addressBus = sprite.patternRowAddress + 8;
      sprite.patternRow1 = this.ppuMemory.readPattern(this.addressBus);
    } else {
      this.addressBus = this.spPatternTableAddress | 0x0FF0; // Dummy fetch for tile $FF
    }
  }

  clearSprites() {
    for (let i = 0; i < this.spriteCache.length; i++) {
      this.spriteCache[i] = null;
      this.spritePixelCache[i] = 0;
    }
  }

  prerenderSprites() {
    for (let i = 0; i < this.spriteCount; i++) {
      const sprite = this.secondaryOAM[i];
      for (let j = 0; j < 8; j++) {
        const cycle = sprite.x + j + 1;
        if (cycle > VIDEO_WIDTH) {
          break;
        }
        if (this.spriteCache[cycle]) {
          continue;
        }
        const columnNumber = sprite.horizontalFlip ? j : j ^ 0x07;
        const colorBit0 = (sprite.patternRow0 >>> columnNumber) & 1;
        const colorBit1 = ((sprite.patternRow1 >>> columnNumber) & 1) << 1;
        const colorNumber = colorBit1 | colorBit0;
        if (colorNumber) {
          this.spriteCache[cycle] = sprite;
          this.spritePixelCache[cycle] = sprite.paletteNumber | colorNumber;
        }
      }
    }
  }

  renderSpritePixel() {
    if (this.isSpritePixelVisible()) {
      return this.spritePixelCache[this.cycle];
    }
    return 0;
  }

  isSpritePixelVisible() {
    return this.spritesVisible && !(this.spriteClipping && (this.csFlags & F_CLIP_LEFT));
  }

  getRenderedSprite() {
    return this.spriteCache[this.cycle];
  }

  //=========================================================
  // Debug rendering
  //=========================================================

  renderDebugFrame() {
    this.renderPatterns();
    this.renderPalettes();
  }

  renderPatterns() {
    for (let tileY = 0; tileY < 16; tileY++) {
      const baseY = tileY << 3;
      for (let tileX = 0; tileX < 32; tileX++) {
        const baseX = tileX << 3;
        const address = ((tileX & 0x10) << 4 | tileY << 4 | tileX & 0x0F) << 4;
        this.renderPatternTile(baseX, baseY, address);
      }
    }
  }

  renderPatternTile(baseX, baseY, address) {
    for (let rowNumber = 0; rowNumber < 8; rowNumber++) {
      const y = baseY + rowNumber;
      const patternBuffer0 = this.ppuMemory.readPattern(address + rowNumber);
      const patternBuffer1 = this.ppuMemory.readPattern(address + rowNumber + 8);
      for (let columnNumber = 0; columnNumber < 8; columnNumber++) {
        const x = baseX + columnNumber;
        const bitPosition = columnNumber ^ 0x07;
        const colorBit0 = (patternBuffer0 >> bitPosition) & 0x01;
        const colorBit1 = ((patternBuffer1 >> bitPosition) & 0x01) << 1;
        const color = this.ppuMemory.readPalette(colorBit1 | colorBit0);
        this.setFramePixelOnPosition(x, y, color);
      }
    }
  }

  renderPalettes() {
    for (let tileY = 0; tileY < 4; tileY++) {
      const baseY = 128 + tileY * 28;
      for (let tileX = 0; tileX < 8; tileX++) {
        const baseX = tileX << 5;
        const color = this.ppuMemory.readPalette((tileY << 3) | tileX);
        this.renderPaletteTile(baseX, baseY, color);
      }
    }
  }

  renderPaletteTile(baseX, baseY, color) {
    for (let y = baseY; y < baseY + 28; y++) {
      for (let x = baseX; x < baseX + 32; x++) {
        this.setFramePixelOnPosition(x, y, color);
      }
    }
  }

}
