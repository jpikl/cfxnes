import {log} from '../common';
import {NMI} from '../proc/interrupts';
import {VIDEO_WIDTH} from './constants';
import {unpackColor, BLACK_COLOR} from './colors';
import {createPaletteVariant} from './palettes';
import * as Flag from './flags';
import Sprite from './Sprite';

export default class PPU {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing PPU');

    // State
    this.scanline = 261;    // Current scanline - from total 262 scanlines (0..261)
    this.cycle = 0;         // Current cycle - from total 341 cycles per scanline (0..340)
    this.cycleFlags = 0;    // Flags for current cycle/scanline
    this.oddFrame = false;  // Whether odd frame is being rendered
    this.addressBus = 0;    // Current value of PPU address bus
    this.clipTopBottom = false;    // Whether to clip 8  top/bottom visible scanlines (value depends on region)
    this.vblankActive = false;     // Whether VBlank is active (not the same thing as VBlank flag)
    this.vblankSuppressed = false; // Whether to suppress VBlank flag setting
    this.nmiSuppressed = false;    // Whether to suppress NMI generation
    this.nmiDelay = 0;             // Number of cycles after which NMI is generated

    // Frame buffer
    this.frameBuffer = null;     // Frame buffer to write video output
    this.frameAvailable = false; // Whether frame buffer was filled with data to render
    this.framePosition = 0;      // Current position in frame buffer

    // Palettes
    this.basePalette = null;             // Base color palette
    this.paletteVariants = new Array(8); // Palette for each combination of colors emphasis bits: BGR
    this.palette = null;                 // Active palette

    // Sprites
    this.spriteCount = 0;  // Total number of sprites on current scanline
    this.spriteNumber = 0; // Number of currently fetched sprite
    this.spriteCache = new Array(261);           // Pre-processed sprite data for current scanline (cycle -> sprite rendered on this cycle)
    this.spritePixelCache = new Uint8Array(261); // Pre-rendered sprite pixels for current scanline (cycle -> sprite pixel rendered on this cycle)

    // Object attribute memory
    this.primaryOAM = new Uint8Array(0x100); // Sprite data (256B = 64 x 4B sprites)
    this.secondaryOAM = new Array(8);        // Sprite data for rendered scanline (up to 8 sprites)

    // Registers
    this.oamAddress = 0;         // 15-bit OAMADDR register
    this.tempAddress = 0;        // 15-bit 'Loopy T' register
    this.vramAddress = 0;        // 15-bit 'Loopy V' register
    this.vramReadBuffer = 0;     //  8-bit VRAM read buffer
    this.writeToggle = false;    //  1-bit 'Loopy W' register
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
    this.patternRowAddress = 0;  // Address of current pattern row

    // Bits of 8-bit PPUCTRL register
    this.bigAddressIncrement = 0;   // C[2] VRAM address increment per CPU read/write of PPUDATA (1 / 32)
    this.spPatternTableAddress = 0; // C[3] Sprite pattern table address for 8x8 sprites ($0000 / $1000)
    this.bgPatternTableAddress = 0; // C[4] Background pattern table address-($0000 / $1000)
    this.bigSprites = 0;            // C[5] Sprite size (8x8 / 8x16)
    this.nmiEnabled = 0;            // C[7] Whether NMI is generated at the start of the VBlank

    // Bits 8-bit PPUMASK register
    this.monochromeMode = 0;     //  M[0]   Color / monochrome mode switch
    this.backgroundClipping = 0; // !M[1]   Whether to hide background in leftmost 8 pixels of screen
    this.spriteClipping = 0;     // !M[2]   Whether to hide sprites in leftmost 8 pixels of screen
    this.backgroundVisible = 0;  //  M[3]   Whether background is visible
    this.spritesVisible = 0;     //  M[4]   Whether sprites are visible
    this.colorEmphasis = 0;      //  M[5-7] Color palette BGR emphasis bits

    // Bits 8-bit PPUSTATUS register
    this.spriteOverflow = 0; // S[5] Whether sprite overflow occurred during rendering
    this.spriteZeroHit = 0;  // S[6] Whether a pixel of sprite #0 was rendered
    this.vblankFlag = 0;     // S[7] Whether VBlank was entered

    // Other units
    this.cpu = null;
    this.ppuMemory = null;
  }

  connect(nes) {
    log.info('Connecting PPU');
    this.cpu = nes.cpu;
    this.ppuMemory = nes.ppuMemory;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting PPU');
    this.resetOAM();
    this.resetRegisters();
    this.resetState();
  }

  resetOAM() {
    this.primaryOAM.fill(0);
    for (let i = 0; i < this.secondaryOAM.length; i++) {
      this.secondaryOAM[i] = new Sprite;
    }
  }

  resetRegisters() {
    this.setControl(0);
    this.setMask(0);
    this.setStatus(0);
    this.oamAddress = 0;
    this.tempAddress = 0;
    this.vramAddress = 0;
    this.vramReadBuffer = 0;
    this.writeToggle = false;
    this.fineXScroll = 0;
    this.patternBuffer0 = 0;
    this.patternBuffer1 = 0;
    this.paletteBuffer0 = 0;
    this.paletteBuffer1 = 0;
    this.paletteLatch0 = 0;
    this.paletteLatch1 = 0;
    this.patternBufferNext0 = 0;
    this.patternBufferNext1 = 0;
    this.paletteLatchNext0 = 0;
    this.paletteLatchNext1 = 0;
  }

  resetState() {
    this.scanline = 261;
    this.cycle = 0;
    this.cycleFlags = 0;
    this.vblankSuppressed = false;
    this.nmiSuppressed = false;
    this.nmiDelay = 0;
    this.oddFrame = false;
    this.spriteCount = 0;
    this.spriteNumber = 0;
    this.clearSprites();
  }

  //=========================================================
  // Configuration
  //=========================================================

  setRegionParams(params) {
    log.info('Setting PPU region parameters');
    this.clipTopBottom = params.ppuClipTopBottom;
  }

  setBasePalette(basePalette) {
    log.info('Setting PPU base palette');
    this.basePalette = basePalette;
    this.createPaletteVariants();
    this.updatePalette();
  }

  getBasePalette() {
    return this.basePalette;
  }

  //=========================================================
  // Color palette
  //=========================================================

  createPaletteVariants() {
    for (let colorEmphasis = 0; colorEmphasis < this.paletteVariants.length; colorEmphasis++) {
      const rRatio = colorEmphasis & 6 ? 0.75 : 1.0; // Dim red when green or blue is emphasized
      const gRatio = colorEmphasis & 5 ? 0.75 : 1.0; // Dim green when red or blue is emphasized
      const bRatio = colorEmphasis & 3 ? 0.75 : 1.0; // Dim blue when red or green is emphasized
      this.paletteVariants[colorEmphasis] = createPaletteVariant(this.basePalette, rRatio, gRatio, bRatio);
    }
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
    this.tempAddress = (this.tempAddress & 0xF3FF) | ((value & 0x03) << 10); // T[11,10] = C[1,0]

    if (this.vblankFlag && !nmiEnabledOld && this.nmiEnabled && !(this.cycleFlags & Flag.VB_END)) {
      this.nmiDelay = 1; // Generate NMI after next instruction when its enabled (from 0 to 1) during VBlank
    }
  }

  setControl(value) {
    this.bigAddressIncrement = (value >>> 2) & 1;
    this.spPatternTableAddress = (value << 9) & 0x1000;
    this.bgPatternTableAddress = (value << 8) & 0x1000;
    this.bigSprites = (value >>> 5) & 1;
    this.nmiEnabled = value >>> 7;
  }

  //=========================================================
  // Mask register ($2001 - PPUMASK)
  //=========================================================

  writeMask(value) {
    this.setMask(value);
    this.updatePalette();
  }

  setMask(value) {
    this.monochromeMode = value & 1;
    this.backgroundClipping = ((~value >>> 1) & 1);
    this.spriteClipping = ((~value >>> 2) & 1);
    this.backgroundVisible = (value >>> 3) & 1;
    this.spritesVisible = (value >>> 4) & 1;
    this.colorEmphasis = (value >>> 5) & 7;
  }

  //=========================================================
  // Status register ($2002 - PPUSTATUS)
  //=========================================================

  readStatus() {
    const value = this.getStatus();

    this.vblankFlag = 0; // Cleared by reading status
    this.writeToggle = false; // Cleared by reading status

    if (this.cycleFlags & Flag.VB_START) {
      this.vblankSuppressed = true; // Reading just before VBlank disables VBlank flag setting
    }

    if (this.cycleFlags & Flag.VB_START2) {
      this.nmiSuppressed = true; // Reading just before VBlank and 2 cycles after disables NMI generation
    }

    return value;
  }

  getStatus() {
    return (this.spriteOverflow << 5)
       | (this.spriteZeroHit << 6)
       | (this.vblankFlag << 7);
  }

  setStatus(value) {
    this.spriteOverflow = (value >>> 5) & 1;
    this.spriteZeroHit = (value >>> 6) & 1;
    this.vblankFlag = value >>> 7;
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
    this.writeToggle = !this.writeToggle;
    if (this.writeToggle) {
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
      this.vramReadBuffer = this.ppuMemory.read(this.vramAddress & 0x2FFF); //  Buffer must not be reloaded from palette address, but from underlying nametable address
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
    this.writeToggle = !this.writeToggle;
    if (this.writeToggle) { // 1st write (X scroll)
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
    if (this.cycleFlags & Flag.INC_CX) {
      this.incrementCoarseXScroll();
    }
    if (this.cycleFlags & Flag.INC_FY) {
      this.incrementFineYScroll();
    }
    if (this.cycleFlags & Flag.COPY_HS) {
      this.copyHorizontalScrollBits();
    }
    if (this.cycleFlags & Flag.COPY_VS) {
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
    const [r, g, b] = unpackColor(this.frameBuffer[(y * VIDEO_WIDTH) + x]);
    return r > 0x12 || g > 0x12 || b > 0x12;
  }

  setFramePixel(color) {
    this.frameBuffer[this.framePosition++] = this.palette[color & 0x3F]; // Only 64 colors
  }

  setFramePixelOnPosition(x, y, color) {
    this.frameBuffer[(y * VIDEO_WIDTH) + x] = this.palette[color & 0x3F]; // Only 64 colors
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
    if (this.cycleFlags & Flag.VB_START) {
      this.enterVBlank();
    } else if (this.cycleFlags & Flag.VB_END) {
      this.leaveVBlank();
    }
  }

  enterVBlank() {
    if (!this.vblankSuppressed) {
      this.vblankFlag = 1;
    }
    this.vblankActive = true;
    this.frameAvailable = true;
    this.nmiDelay = 2;
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
  // Scanline/cycle update
  //=========================================================

  incrementCycle() {
    if ((this.cycleFlags & Flag.SKIP) && this.oddFrame && this.isRenderingEnabled()) {
      this.cycle++; // One cycle skipped on odd frames
    }

    this.cycle++;

    if (this.cycle > 340) {
      this.incrementScanline();
    }

    this.cycleFlags = Flag.compute(this.scanline, this.cycle); // Update flags for the new scanline/cycle
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
        this.preRenderSprites(); // Sprites are not rendered on scanline 0
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
    if (this.cycleFlags & Flag.FETCH_NT) {
      this.fetchNametable();
    } else if (this.cycleFlags & Flag.FETCH_AT) {
      this.fetchAttribute();
    } else if (this.cycleFlags & Flag.FETCH_BGL) {
      this.fetchBackgroundLow();
    } else if (this.cycleFlags & Flag.FETCH_BGH) {
      this.fetchBackgroundHigh();
    } else if (this.cycleFlags & Flag.FETCH_SPL) {
      this.fetchSpriteLow();
    } else if (this.cycleFlags & Flag.FETCH_SPH) {
      this.fetchSpriteHigh();
    }
  }

  doRendering() {
    if (this.cycleFlags & Flag.EVAL_SP) {
      this.evaluateSprites();
    }
    if (this.cycleFlags & Flag.COPY_BG) {
      this.copyBackground();
    }
    if (this.cycleFlags & Flag.RENDER) {
      this.updateFramePixel();
    }
    if (this.cycleFlags & Flag.SHIFT_BG) {
      this.shiftBackground();
    }
  }

  skipRendering() {
    if (this.cycleFlags & Flag.RENDER) {
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
    if (this.clipTopBottom && (this.cycleFlags & Flag.CLIP_TB)) {
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
          return spriteColorAddress; // The sprite has priority over the background
        }
      }

      return backgroundColorAddress; // Only the background is visible or it has priority over the sprite
    }

    if (spriteColorAddress & 0x03) {
      return spriteColorAddress; // Only the sprite is visible
    }

    return 0; // Use backdrop color
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
  // Each pattern is 16B long and consists from two 8x8 matrices.
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
  //
  //                                          [BBBBBBBB] - Next tile's pattern data,
  //                                          [BBBBBBBB] - 2 bits per pixel
  //                                           ||||||||
  //                                           vvvvvvvv
  //       Serial-to-parallel - [AAAAAAAA] <- [BBBBBBBB] - Parallel-to-serial
  //          shift registers - [AAAAAAAA] <- [BBBBBBBB] - shift registers
  //                             vvvvvvvv
  //                             ||||||||           [Sprites 0..7]----+
  //                             ||||||||                             |
  // [fine_x selects a bit]---->[  Mux   ]-------------------->[Priority mux]----->[Pixel]
  //                             ||||||||
  //                             ^^^^^^^^
  //                            [PPPPPPPP] <- [1-bit latch]
  //                            [PPPPPPPP] <- [1-bit latch]
  //                                                ^
  //                                                |
  //                     [2-bit Palette Attribute for next tile (from attribute table)]

  fetchNametable() {
    this.addressBus = 0x2000 | (this.vramAddress & 0x0FFF);

    const patternNumber = this.ppuMemory.readNametable(this.addressBus); // Nametable byte fetch
    const patternAddress = this.bgPatternTableAddress + (patternNumber << 4);
    const fineYScroll = (this.vramAddress >>> 12) & 0x07;

    this.patternRowAddress = patternAddress + fineYScroll;
  }

  fetchAttribute() {
    const attributeTableAddress = 0x23C0 | (this.vramAddress & 0x0C00);
    const attributeNumber = ((this.vramAddress >>> 4) & 0x38) | ((this.vramAddress >>> 2) & 0x07);

    this.addressBus = attributeTableAddress + attributeNumber;

    const attribute = this.ppuMemory.readNametable(this.addressBus); // Attribute byte fetch
    const areaNumber = ((this.vramAddress >>> 4) & 0x04) | (this.vramAddress & 0x02);
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
    return this.backgroundVisible && !(this.backgroundClipping && (this.cycleFlags & Flag.CLIP_LEFT));
  }

  //=========================================================
  // Sprite rendering
  //=========================================================

  // Before each scanline, the first 8 visible sprites on that scanline are fetched into
  // secondary OAM. Each sprite has 4B of data.
  //
  // Byte 0 - y screen coordinate (decremented by 1, because rendering of fetched sprites is delayed)
  // Byte 1 - pattern number PPPP.PPPT (if 8x16 sprites are enabled, bit T selects the pattern table,
  //          otherwise it is selected by bit 4 of control register)
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
      sprite.paletteNumber = 0x10 | ((attributes & 0x03) << 2);
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
    this.spriteCache.fill(null);
    this.spritePixelCache.fill(0);
  }

  preRenderSprites() {
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
    return this.spritesVisible && !(this.spriteClipping && (this.cycleFlags & Flag.CLIP_LEFT));
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
        const address = (((tileX & 0x10) << 4) | (tileY << 4) | (tileX & 0x0F)) << 4;

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
      const baseY = (tileY * 28) + 128;

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
