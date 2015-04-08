import { VIDEO_WIDTH, VIDEO_HEIGHT }           from "../common/constants";
import { Interrupt }                           from "../common/types";
import { BLACK_COLOR, packColor, unpackColor } from "../utils/colors";
import { logger }                              from "../utils/logger";
import { newByteArray, newUintArray }          from "../utils/system";

//=========================================================
// PPU cycle/scanlines flags
//=========================================================

const F_RENDER    = 1 <<  1; // Rendering cycle
const F_FETCH_NT  = 1 <<  2; // Cycle where nametable byte is fetched
const F_FETCH_AT  = 1 <<  3; // Cycle where attribute byte is fetched
const F_FETCH_BGL = 1 <<  4; // Cycle where low background byte is fetched
const F_FETCH_BGH = 1 <<  5; // Cycle where high background byte is fetched
const F_FETCH_SPL = 1 <<  6; // Cycle where low sprite byte is fetched
const F_FETCH_SPH = 1 <<  7; // Cycle where high sprite byte is fetched
const F_COPY_BG   = 1 <<  8; // Cycle where background buffers are copied
const F_SHIFT_BG  = 1 <<  9; // Cycle where background buffers are shifted
const F_EVAL_SP   = 1 << 10; // Cycle where sprites for next line are being evaluated
const F_CLIP_LEFT = 1 << 11; // Cycle where 8 left pixels are clipped
const F_CLIP_NTSC = 1 << 12; // Cycle where 8 top/bottom pixels are clipped
const F_INC_CX    = 1 << 13; // Cycle where coarse X scroll is incremented
const F_INC_FY    = 1 << 14; // Cycle where fine Y scroll is incremented
const F_COPY_HS   = 1 << 15; // Cycle where horizontal scroll bits are copied
const F_COPY_VS   = 1 << 16; // Cycle where vertical scroll bits are copied
const F_VB_START  = 1 << 17; // Cycle where VBlank starts
const F_VB_START2 = 1 << 18; // Cycle where VBlank starts and the 2 following cycles
const F_VB_END    = 1 << 19; // Cycle where VBlank ends
const F_SKIP      = 1 << 20; // Cycle which is skipped during odd frames

//=========================================================
// Cycle flags table
//=========================================================

var cycleFlagsTable = newUintArray(341);

for (var i = 0; i < cycleFlagsTable.length; i++) {
    if (i >= 1 && i <= 256) {
        cycleFlagsTable[i] |= F_RENDER;
        cycleFlagsTable[i] |= F_CLIP_NTSC;
    }
    if ((i & 0x7) === 1 || i === 339) {
        cycleFlagsTable[i] |= F_FETCH_NT;
    }
    if ((i & 0x7) === 3 && i !== 339) {
        cycleFlagsTable[i] |= F_FETCH_AT;
    }
    if ((i & 0x7) === 5) {
        cycleFlagsTable[i] |= (i <= 256 || i >= 321) ? F_FETCH_BGL : F_FETCH_SPL;
    }
    if ((i & 0x7) === 7) {
        cycleFlagsTable[i] |= (i <= 256 || i >= 321) ? F_FETCH_BGH : F_FETCH_SPH;
    }
    if ((i & 0x7) === 0 && i >= 8 && i <= 256 || i === 328 || i === 336) {
        cycleFlagsTable[i] |= F_INC_CX;
    }
    if ((i & 0x7) === 1 && i >= 9 && i <= 257 || i === 329 || i === 337) {
        cycleFlagsTable[i] |= F_COPY_BG;
    }
    if ((i >= 1 && i <= 256) || (i >= 321 && i <= 336)) {
        cycleFlagsTable[i] |= F_SHIFT_BG;
    }
    if (i >= 280 && i <= 304) {
        cycleFlagsTable[i] |= F_COPY_VS;
    }
    if (i >= 1 && i <= 8) {
        cycleFlagsTable[i] |= F_CLIP_LEFT;
    }
    if (i >= 1 && i <= 3) {
       cycleFlagsTable[i] |= F_VB_START2;
    }
}

cycleFlagsTable[1]   |= F_VB_START;
cycleFlagsTable[1]   |= F_VB_END;
cycleFlagsTable[65]  |= F_EVAL_SP;
cycleFlagsTable[256] |= F_INC_FY;
cycleFlagsTable[257] |= F_COPY_HS;
cycleFlagsTable[338] |= F_SKIP;

//=========================================================
// Scanline flags table
//=========================================================

var scanlineFlagsTable = newUintArray(262);

for (var i = 0; i < scanlineFlagsTable.length; i++) {
    if (i <= 239) {
        scanlineFlagsTable[i] |= F_RENDER;
        scanlineFlagsTable[i] |= F_SHIFT_BG;
        scanlineFlagsTable[i] |= F_CLIP_LEFT;
    }
    if (i <= 239 || i === 261) {
        scanlineFlagsTable[i] |= F_FETCH_NT;
        scanlineFlagsTable[i] |= F_FETCH_AT;
        scanlineFlagsTable[i] |= F_FETCH_BGL;
        scanlineFlagsTable[i] |= F_FETCH_BGH;
        scanlineFlagsTable[i] |= F_FETCH_SPL;
        scanlineFlagsTable[i] |= F_FETCH_SPH;
        scanlineFlagsTable[i] |= F_COPY_BG;
        scanlineFlagsTable[i] |= F_EVAL_SP;
        scanlineFlagsTable[i] |= F_INC_CX;
        scanlineFlagsTable[i] |= F_INC_FY;
        scanlineFlagsTable[i] |= F_COPY_HS;
    }
    if (i <= 7 || (i >= 232 && i <= 239)) {
        scanlineFlagsTable[i] |= F_CLIP_NTSC;
    }
}

scanlineFlagsTable[241] |= F_VB_START;
scanlineFlagsTable[241] |= F_VB_START2;
scanlineFlagsTable[261] |= F_COPY_VS;
scanlineFlagsTable[261] |= F_VB_END;
scanlineFlagsTable[261] |= F_SKIP;

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

export class PPU {

    init(cpu, ppuMemory) {
        this.cpu = cpu;
        this.ppuMemory = ppuMemory;
        this.ntscMode = true;
        this.colorEmphasis = 0; // Color palette BGR emphasis bits
    }

    //=========================================================
    // Power-up state initialization
    //=========================================================

    powerUp() {
        logger.info("Reseting PPU");
        this.resetOAM();
        this.resetRegisters();
        this.resetVariables();
    }

    resetOAM() {
        this.primaryOAM = newByteArray(0x100); // Sprite data - 256B (64 x 4B sprites)
        this.secondaryOAM = new Array(8);      // Sprite data for rendered scanline (up to 8 sprites)
        for (var i = 0; i < this.secondaryOAM.length; i++) {
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
        this.scanline = 261;         // Current scanline - from total 262 scanlines (0..261)
        this.cycle = 0;              // Current cycle - from total 341 cycles per scanline (0..340)
        this.cycleFlags = 0;         // Flags for current cycle/scanline
        this.suppressVBlank = false; // Whether to suppress VBlank flag setting
        this.supressNMI = false;     // Whether to supress NMI generation
        this.nmiDelay = 0;           // Number of cycles after which NMI is generated
        this.oddFrame = false;       // Whether odd frame is being rendered
        this.spriteCount = 0;        // Total number of sprites on current scanline
        this.spriteNumber = 0;       // Number of currently fetched sprite
        this.spriteCache = new Array(261);         // Preprocesed sprite data for current scanline (cycle -> sprite rendered on that cycle)
        this.spritePixelCache = newByteArray(261); // Prerendered sprite pixels for current scanline (cycle -> sprite pixel rendered on that cycle)
    }

    //=========================================================
    // Configuration
    //=========================================================

    setNTSCMode(ntscMode) {
        this.ntscMode = ntscMode;
    }

    setRGBPalette(rgbPalette) {
        this.createRGBAPalettes(rgbPalette);
        this.updateRGBAPalette();
    }

    //=========================================================
    // Palette generation
    //=========================================================

    createRGBAPalettes(rgbPalette) {
        this.rgbaPalettes = new Array(8); // Palettes for each combination of colors emphasis bits: BGR
        for (var colorEmphasis = 0; colorEmphasis < this.rgbaPalettes.length; colorEmphasis++) {
            var rRatio = colorEmphasis & 6 ? 0.75 : 1.0; // Dim red when green or blue is emphasized
            var gRatio = colorEmphasis & 5 ? 0.75 : 1.0; // Dim green when red or blue is emphasized
            var bRatio = colorEmphasis & 3 ? 0.75 : 1.0; // Dim blue when red or green is emphasized
            this.rgbaPalettes[colorEmphasis] = this.createRGBAPalette(rgbPalette, rRatio, gRatio, bRatio);
        }
    }

    createRGBAPalette(rgbPalette, rRatio, gRatio, bRatio) {
        var rgbaPalette = newUintArray(rgbPalette.length);
        for (var i = 0; i < rgbPalette.length; i++) {
            var rgb = rgbPalette[i];
            var r = Math.floor(rRatio * ((rgb >>> 16) & 0xFF));
            var g = Math.floor(gRatio * ((rgb >>>  8) & 0xFF));
            var b = Math.floor(bRatio * ( rgb         & 0xFF));
            rgbaPalette[i] = packColor(r, g, b);
        }
        return rgbaPalette;
    }

    updateRGBAPalette() {
        this.rgbaPalette = this.rgbaPalettes[this.colorEmphasis];
    }

    //=========================================================
    // Control register ($2000 - PPUCTRL)
    //=========================================================

    writeControl(value) {
        var nmiEnabledOld;
        nmiEnabledOld = this.nmiEnabled;
        this.setControl(value);
        this.tempAddress = (this.tempAddress & 0xF3FF) | (value & 0x03) << 10;
        if (this.vblankFlag && !nmiEnabledOld && this.nmiEnabled && !(this.cycleFlags & F_VB_END)) {
            this.nmiDelay = 15; // Immediate occurence should be after next instruction.
        }
        return value;
    }

    setControl(value) {
        this.bigAddressIncrement = (value >>> 2) & 1;
        this.spPatternTableAddress = (value << 9) & 0x1000;
        this.bgPatternTableAddress = (value << 8) & 0x1000;
        this.bigSprites = (value >>> 5) & 1;
        return this.nmiEnabled = value >>> 7;
    }

    writeMask(value) {
        this.setMask(value);
        this.updateRGBAPalette();
        return value;
    }

    setMask(value) {
        this.monochromeMode = value & 1;
        this.backgroundClipping = !((value >>> 1) & 1);
        this.spriteClipping = !((value >>> 2) & 1);
        this.backgroundVisible = (value >>> 3) & 1;
        this.spritesVisible = (value >>> 4) & 1;
        return this.colorEmphasis = (value >>> 5) & 7;
    }

    readStatus() {
        var value;
        value = this.getStatus();
        this.vblankFlag = 0;
        this.writeToogle = 0;
        if (this.cycleFlags & F_VB_START) {
            this.suppressVBlank = true;
        }
        if (this.cycleFlags & F_VB_START2) {
            this.supressNMI = true;
        }
        return value;
    }

    getStatus() {
        return this.spriteOverflow << 5 | this.spriteZeroHit << 6 | this.vblankFlag << 7;
    }

    setStatus(value) {
        this.spriteOverflow = (value >>> 5) & 1;
        this.spriteZeroHit = (value >>> 6) & 1;
        return this.vblankFlag = value >>> 7;
    }

    writeOAMAddress(address) {
        return this.oamAddress = address;
    }

    readOAMData() {
        var value;
        value = this.primaryOAM[this.oamAddress];
        if ((this.oamAddress & 0x03) === 2) {
            value &= 0xE3;
        }
        return value;
    }

    writeOAMData(value) {
        if (!this.isRenderingActive()) {
            this.primaryOAM[this.oamAddress] = value;
        }
        this.oamAddress = (this.oamAddress + 1) & 0xFF;
        return value;
    }

    writeAddress(address) {
        var addressHigh, addressLow;
        this.writeToogle = !this.writeToogle;
        if (this.writeToogle) {
            addressHigh = (address & 0x3F) << 8;
            this.tempAddress = (this.tempAddress & 0x00FF) | addressHigh;
        } else {
            addressLow = address;
            this.tempAddress = (this.tempAddress & 0xFF00) | addressLow;
            this.vramAddress = this.tempAddress;
        }
        return address;
    }

    readData() {
        var value;
        if (this.isPaletteAddress(this.vramAddress)) {
            value = this.ppuMemory.read(this.vramAddress);
            this.vramReadBuffer = this.ppuMemory.read(this.vramAddress & 0x2FFF);
            this.incrementAddress();
            return value;
        } else {
            value = this.vramReadBuffer;
            this.vramReadBuffer = this.ppuMemory.read(this.vramAddress);
            this.incrementAddress();
            return value;
        }
    }

    writeData(value) {
        if (!this.isRenderingActive()) {
            this.ppuMemory.write(this.vramAddress, value);
        }
        this.incrementAddress();
        return value;
    }

    incrementAddress() {
        return this.vramAddress = (this.vramAddress + this.getAddressIncrement()) & 0xFFFF;
    }

    getAddressIncrement() {
        if (this.bigAddressIncrement) {
            return 0x20;
        } else {
            return 0x01;
        }
    }

    isPaletteAddress(address) {
        return (address & 0x3F00) === 0x3F00;
    }

    writeScroll(value) {
        var coarseXScroll, coarseYScroll, fineYScroll;
        this.writeToogle = !this.writeToogle;
        if (this.writeToogle) {
            this.fineXScroll = value & 0x07;
            coarseXScroll = value >>> 3;
            this.tempAddress = (this.tempAddress & 0xFFE0) | coarseXScroll;
        } else {
            fineYScroll = (value & 0x07) << 12;
            coarseYScroll = (value & 0xF8) << 2;
            this.tempAddress = (this.tempAddress & 0x0C1F) | coarseYScroll | fineYScroll;
        }
        return value;
    }

    updateScrolling() {
        if (this.cycleFlags & F_INC_CX) {
            this.incrementCoarseXScroll();
        }
        if (this.cycleFlags & F_INC_FY) {
            this.incrementFineYScroll();
        }
        if (this.cycleFlags & F_COPY_HS) {
            this.copyHorizontalScrollBits();
        }
        if (this.cycleFlags & F_COPY_VS) {
            return this.copyVerticalScrollBits();
        }
    }

    copyHorizontalScrollBits() {
        return this.vramAddress = (this.vramAddress & 0x7BE0) | (this.tempAddress & 0x041F);
    }

    copyVerticalScrollBits() {
        return this.vramAddress = (this.vramAddress & 0x041F) | (this.tempAddress & 0x7BE0);
    }

    incrementCoarseXScroll() {
        if ((this.vramAddress & 0x001F) === 0x001F) {
            this.vramAddress &= 0xFFE0;
            return this.vramAddress ^= 0x0400;
        } else {
            return this.vramAddress += 0x0001;
        }
    }

    incrementFineYScroll() {
        if ((this.vramAddress & 0x7000) === 0x7000) {
            this.vramAddress &= 0x0FFF;
            return this.incrementCoarseYScroll();
        } else {
            return this.vramAddress += 0x1000;
        }
    }

    incrementCoarseYScroll() {
        if ((this.vramAddress & 0x03E0) === 0x03E0) {
            return this.vramAddress &= 0xFC1F;
        } else if ((this.vramAddress & 0x03E0) === 0x03A0) {
            this.vramAddress &= 0xFC1F;
            return this.vramAddress ^= 0x0800;
        } else {
            return this.vramAddress += 0x0020;
        }
    }

    startFrame(buffer) {
        this.framePosition = 0;
        this.frameBuffer = buffer;
        return this.frameAvailable = false;
    }

    isFrameAvailable() {
        return this.frameAvailable;
    }

    isBrightFramePixel(x, y) {
        var b, g, r, ref;
        if (y < this.scanline - 5 || y >= this.scanline) {
            return false;
        }
        ref = unpackColor(this.frameBuffer[y * VIDEO_WIDTH + x]), r = ref[0], g = ref[1], b = ref[2];
        return r > 0x12 || g > 0x12 || b > 0x12;
    }

    setFramePixel(color) {
        return this.frameBuffer[this.framePosition++] = this.rgbaPalette[color & 0x3F]; // Only 64 colors
    }

    setFramePixelOnPosition(x, y, color) {
        return this.frameBuffer[y * VIDEO_WIDTH + x] = this.rgbaPalette[color & 0x3F];
    }

    clearFramePixel() {
        return this.frameBuffer[this.framePosition++] = BLACK_COLOR;
    }

    updateVBlank() {
        if (this.nmiDelay) {
            if (this.nmiDelay > 12 && !this.nmiEnabled) {
                this.nmiDelay = 0; // NMI disabled near the time vlbank flag is set
            } else if (!--this.nmiDelay && !this.supressNMI) {
                this.cpu.activateInterrupt(Interrupt.NMI);
            }
        }
        if (this.cycleFlags & F_VB_START) {
            this.enterVBlank();
        } else if (this.cycleFlags & F_VB_END) {
            this.leaveVBlank();
        }

    }

    enterVBlank() {
        this.vblankActive = true;
        if (!this.suppressVBlank) {
            this.vblankFlag = 1;
        }
        this.nmiDelay = 14;
        return this.frameAvailable = true;
    }

    leaveVBlank() {
        this.vblankActive = false;
        this.vblankFlag = 0;
        this.suppressVBlank = false;
        this.supressNMI = false;
        return this.spriteZeroHit = 0;
    }

    incrementCycle() {
        if ((this.cycleFlags & F_SKIP) && this.oddFrame && this.isRenderingEnabled()) {
            this.cycle++;
        }
        this.cycle++;
        if (this.cycle > 340) {
            this.incrementScanline();
        }
        return this.cycleFlags = cycleFlagsTable[this.cycle] & scanlineFlagsTable[this.scanline];
    }

    incrementScanline() {
        var ref;
        this.cycle = 0;
        this.scanline++;
        if (this.scanline > 261) {
            this.incrementFrame();
        }
        if ((0 <= (ref = this.scanline) && ref <= 239)) {
            return this.prerenderSprites();
        }
    }

    incrementFrame() {
        this.scanline = 0;
        return this.oddFrame = !this.oddFrame;
    }

    tick() {
        if (this.isRenderingEnabled()) {
            this.fetchData();
            if (this.cycleFlags & F_EVAL_SP) {
                this.evaluateSprites();
            }
            if (this.cycleFlags & F_COPY_BG) {
                this.copyBackground();
            }
            if (this.cycleFlags & F_RENDER) {
                this.updateFramePixel();
            }
            if (this.cycleFlags & F_SHIFT_BG) {
                this.shiftBackground();
            }
            this.updateScrolling();
        } else {
            if (this.cycleFlags & F_RENDER) {
                this.clearFramePixel();
            }
            this.addressBus = this.vramAddress;
        }
        this.updateVBlank();
        this.incrementCycle();
        return this.mapper.tick();
    }

    fetchData() {
        if (this.cycleFlags & F_FETCH_NT) {
            return this.fetchNametable();
        } else if (this.cycleFlags & F_FETCH_AT) {
            return this.fetchAttribute();
        } else if (this.cycleFlags & F_FETCH_BGL) {
            return this.fetchBackgroundLow();
        } else if (this.cycleFlags & F_FETCH_BGH) {
            return this.fetchBackgroundHigh();
        } else if (this.cycleFlags & F_FETCH_SPL) {
            return this.fetchSpriteLow();
        } else if (this.cycleFlags & F_FETCH_SPH) {
            return this.fetchSpriteHigh();
        }
    }

    isRenderingActive() {
        return !this.vblankActive && this.isRenderingEnabled();
    }

    isRenderingEnabled() {
        return this.spritesVisible || this.backgroundVisible;
    }

    updateFramePixel() {
        var address, color;
        if (this.ntscMode && this.cycleFlags & F_CLIP_NTSC) {
            return this.clearFramePixel();
        } else {
            address = this.renderFramePixel();
            color = this.ppuMemory.readPalette(address);
            return this.setFramePixel(color);
        }
    }

    renderFramePixel() {
        var backgroundColor, sprite, spriteColor;
        backgroundColor = this.renderBackgroundPixel();
        spriteColor = this.renderSpritePixel();
        if (backgroundColor & 0x03) {
            if (spriteColor & 0x03) {
                sprite = this.getRenderedSprite();
                this.spriteZeroHit || (this.spriteZeroHit = sprite.zeroSprite);
                if (sprite.inFront) {
                    return spriteColor;
                } else {
                    return backgroundColor;
                }
            } else {
                return backgroundColor;
            }
        } else if (spriteColor & 0x03) {
            return spriteColor;
        } else {
            return 0;
        }
    }

    fetchNametable() {
        var fineYScroll, patternAddress, patternNumer;
        this.addressBus = 0x2000 | this.vramAddress & 0x0FFF;
        patternNumer = this.ppuMemory.readNameAttr(this.addressBus);
        patternAddress = this.bgPatternTableAddress + (patternNumer << 4);
        fineYScroll = (this.vramAddress >>> 12) & 0x07;
        return this.patternRowAddress = patternAddress + fineYScroll;
    }

    fetchAttribute() {
        var areaNumber, attribute, attributeNumber, attributeTableAddress, paletteNumber;
        attributeTableAddress = 0x23C0 | this.vramAddress & 0x0C00;
        attributeNumber = (this.vramAddress >>> 4) & 0x38 | (this.vramAddress >>> 2) & 0x07;
        this.addressBus = attributeTableAddress + attributeNumber;
        attribute = this.ppuMemory.readNameAttr(this.addressBus);
        areaNumber = (this.vramAddress >>> 4) & 0x04 | this.vramAddress & 0x02;
        paletteNumber = (attribute >>> areaNumber) & 0x03;
        this.paletteLatchNext0 = paletteNumber & 1;
        return this.paletteLatchNext1 = (paletteNumber >>> 1) & 1;
    }

    fetchBackgroundLow() {
        this.addressBus = this.patternRowAddress;
        return this.patternBufferNext0 = this.ppuMemory.readPattern(this.addressBus);
    }

    fetchBackgroundHigh() {
        this.addressBus = this.patternRowAddress + 8;
        return this.patternBufferNext1 = this.ppuMemory.readPattern(this.addressBus);
    }

    copyBackground() {
        this.patternBuffer0 |= this.patternBufferNext0;
        this.patternBuffer1 |= this.patternBufferNext1;
        this.paletteLatch0 = this.paletteLatchNext0;
        return this.paletteLatch1 = this.paletteLatchNext1;
    }

    shiftBackground() {
        this.patternBuffer0 = this.patternBuffer0 << 1;
        this.patternBuffer1 = this.patternBuffer1 << 1;
        this.paletteBuffer0 = (this.paletteBuffer0 << 1) | this.paletteLatch0;
        return this.paletteBuffer1 = (this.paletteBuffer1 << 1) | this.paletteLatch1;
    }

    renderBackgroundPixel() {
        var colorBit0, colorBit1, paletteBit0, paletteBit1;
        if (this.isBackgroundPixelVisible()) {
            colorBit0 = ((this.patternBuffer0 << this.fineXScroll) >> 15) & 0x1;
            colorBit1 = ((this.patternBuffer1 << this.fineXScroll) >> 14) & 0x2;
            paletteBit0 = ((this.paletteBuffer0 << this.fineXScroll) >> 5) & 0x4;
            paletteBit1 = ((this.paletteBuffer1 << this.fineXScroll) >> 4) & 0x8;
            return paletteBit1 | paletteBit0 | colorBit1 | colorBit0;
        } else {
            return 0;
        }
    }

    isBackgroundPixelVisible() {
        return this.backgroundVisible && !(this.backgroundClipping && (this.cycleFlags & F_CLIP_LEFT));
    }

    evaluateSprites() {
        var address, ap, attributes, bottomY, height, len, patternAddress, patternNumber, patternTableAddress, ref, rowNumber, sprite, spriteY, topY;
        this.spriteNumber = 0;
        this.spriteCount = 0;
        this.spriteOverflow = 0;
        height = this.bigSprites ? 16 : 8;
        bottomY = this.scanline;
        topY = Math.max(0, bottomY - height);
        ref = this.primaryOAM;
        for (address = ap = 0, len = ref.length; ap < len; address = ap += 4) {
            spriteY = ref[address];
            if (!((topY < spriteY && spriteY <= bottomY))) {
                continue;
            }
            patternTableAddress = this.spPatternTableAddress;
            patternNumber = this.primaryOAM[address + 1];
            if (this.bigSprites) {
                patternTableAddress = (patternNumber & 1) << 12;
                patternNumber &= 0xFE;
            }
            attributes = this.primaryOAM[address + 2];
            rowNumber = bottomY - spriteY;
            if (attributes & 0x80) {
                rowNumber = height - rowNumber - 1;
            }
            if (rowNumber >= 8) {
                rowNumber -= 8;
                patternNumber++;
            }
            patternAddress = patternTableAddress + (patternNumber << 4);
            sprite = this.secondaryOAM[this.spriteCount++];
            sprite.x = this.primaryOAM[address + 3];
            sprite.zeroSprite = address === 0;
            sprite.horizontalFlip = attributes & 0x40;
            sprite.paletteNumber = 0x10 | (attributes & 0x03) << 2;
            sprite.inFront = (attributes & 0x20) === 0;
            sprite.patternRowAddress = patternAddress + rowNumber;
            if (this.spriteCount === 8) {
                this.spriteOverflow = 1;
                break;
            }
        }
        return void 0;
    }

    fetchSpriteLow() {
        var sprite;
        if (this.spriteNumber < this.spriteCount) {
            sprite = this.secondaryOAM[this.spriteNumber];
            this.addressBus = sprite.patternRowAddress;
            return sprite.patternRow0 = this.ppuMemory.readPattern(this.addressBus);
        } else {
            return this.addressBus = this.spPatternTableAddress | 0x0FF0;
        }
    }

    fetchSpriteHigh() {
        var sprite;
        if (this.spriteNumber < this.spriteCount) {
            sprite = this.secondaryOAM[this.spriteNumber++];
            this.addressBus = sprite.patternRowAddress + 8;
            return sprite.patternRow1 = this.ppuMemory.readPattern(this.addressBus);
        } else {
            return this.addressBus = this.spPatternTableAddress | 0x0FF0;
        }
    }

    prerenderSprites() {
        var ap, aq, ar, colorBit0, colorBit1, colorNumber, columnNumber, ref, ref1, sprite, x;
        for (i = ap = 0, ref = this.spriteCache.length; 0 <= ref ? ap < ref : ap > ref; i = 0 <= ref ? ++ap : --ap) {
            this.spriteCache[i] = null;
            this.spritePixelCache[i] = 0;
        }
        for (i = aq = 0, ref1 = this.spriteCount; 0 <= ref1 ? aq < ref1 : aq > ref1; i = 0 <= ref1 ? ++aq : --aq) {
            sprite = this.secondaryOAM[i];
            for (columnNumber = ar = 0; ar <= 7; columnNumber = ++ar) {
                x = sprite.x + columnNumber + 1;
                if (x > VIDEO_WIDTH) {
                    break;
                }
                if (x < 1 || this.spriteCache[x]) {
                    continue;
                }
                if (!sprite.horizontalFlip) {
                    columnNumber ^= 0x07;
                }
                colorBit0 = (sprite.patternRow0 >>> columnNumber) & 1;
                colorBit1 = ((sprite.patternRow1 >>> columnNumber) & 1) << 1;
                colorNumber = colorBit1 | colorBit0;
                if (colorNumber) {
                    this.spriteCache[x] = sprite;
                    this.spritePixelCache[x] = sprite.paletteNumber | colorNumber;
                }
            }
        }
        return void 0;
    }

    renderSpritePixel() {
        if (this.isSpritePixelVisible()) {
            return this.spritePixelCache[this.cycle];
        } else {
            return 0;
        }
    }

    isSpritePixelVisible() {
        return this.spritesVisible && !(this.spriteClipping && (this.cycleFlags & F_CLIP_LEFT));
    }

    getRenderedSprite() {
        return this.spriteCache[this.cycle];
    }

    renderDebugFrame() {
        this.renderPatterns();
        return this.renderPalettes();
    }

    renderPatterns() {
        var address, ap, aq, baseX, baseY, tileX, tileY;
        for (tileY = ap = 0; ap < 16; tileY = ++ap) {
            baseY = tileY << 3;
            for (tileX = aq = 0; aq < 32; tileX = ++aq) {
                baseX = tileX << 3;
                address = ((tileX & 0x10) << 4 | tileY << 4 | tileX & 0x0F) << 4;
                this.renderPatternTile(baseX, baseY, address);
            }
        }
        return void 0;
    }

    renderPatternTile(baseX, baseY, address) {
        var ap, aq, bitPosition, color, colorSelect1, colorSelect2, columnNumber, patternBuffer0, patternBuffer1, rowNumber, x, y;
        for (rowNumber = ap = 0; ap < 8; rowNumber = ++ap) {
            y = baseY + rowNumber;
            patternBuffer0 = this.ppuMemory.readPattern(address + rowNumber);
            patternBuffer1 = this.ppuMemory.readPattern(address + rowNumber + 8);
            for (columnNumber = aq = 0; aq < 8; columnNumber = ++aq) {
                x = baseX + columnNumber;
                bitPosition = columnNumber ^ 0x07;
                colorSelect1 = (patternBuffer0 >> bitPosition) & 0x01;
                colorSelect2 = ((patternBuffer1 >> bitPosition) & 0x01) << 1;
                color = this.ppuMemory.readPalette(colorSelect2 | colorSelect1);
                this.setFramePixelOnPosition(x, y, color);
            }
        }
        return void 0;
    }

    renderPalettes() {
        var ap, aq, baseX, baseY, color, tileX, tileY;
        for (tileY = ap = 0; ap < 4; tileY = ++ap) {
            baseY = 128 + tileY * 28;
            for (tileX = aq = 0; aq < 8; tileX = ++aq) {
                baseX = tileX << 5;
                color = this.ppuMemory.readPalette((tileY << 3) | tileX);
                this.renderPaletteTile(baseX, baseY, color);
            }
        }
        return void 0;
    }

    renderPaletteTile(baseX, baseY, color) {
        var ap, aq, ref, ref1, ref2, ref3, x, y;
        for (y = ap = ref = baseY, ref1 = baseY + 28; ref <= ref1 ? ap < ref1 : ap > ref1; y = ref <= ref1 ? ++ap : --ap) {
            for (x = aq = ref2 = baseX, ref3 = baseX + 32; ref2 <= ref3 ? aq < ref3 : aq > ref3; x = ref2 <= ref3 ? ++aq : --aq) {
                this.setFramePixelOnPosition(x, y, color);
            }
        }
        return void 0;
    }

    connectMapper(mapper) {
        return this.mapper = mapper;
    }

}

PPU["dependencies"] = [ "cpu", "ppuMemory" ];
