import { VIDEO_WIDTH, VIDEO_HEIGHT }           from "../common/constants";
import { Interrupt }                           from "../common/types";
import { BLACK_COLOR, packColor, unpackColor } from "../utils/colors";
import { logger }                              from "../utils/logger";
import { newUint8Array, newUint32Array }       from "../utils/system";

const F_RENDER = 1 << 1;
const F_FETCH_NT = 1 << 2;
const F_FETCH_AT = 1 << 3;
const F_FETCH_BGL = 1 << 4;
const F_FETCH_BGH = 1 << 5;
const F_FETCH_SPL = 1 << 6;
const F_FETCH_SPH = 1 << 7;
const F_COPY_BG = 1 << 8;
const F_SHIFT_BG = 1 << 9;
const F_EVAL_SP = 1 << 10;
const F_CLIP_LEFT = 1 << 11;
const F_CLIP_NTSC = 1 << 12;
const F_INC_CX = 1 << 13;
const F_INC_FY = 1 << 14;
const F_COPY_HS = 1 << 15;
const F_COPY_VS = 1 << 16;
const F_VB_START = 1 << 17;
const F_VB_START2 = 1 << 18;
const F_VB_END = 1 << 19;
const F_SKIP = 1 << 20;

var cycleFlagsTable = newUint32Array(340);
var scanlineFlagsTable = newUint32Array(261);

for (i = j = 1; j <= 256; i = ++j) {
  cycleFlagsTable[i] |= F_RENDER;
}

for (i = k = 0; k <= 239; i = ++k) {
  scanlineFlagsTable[i] |= F_RENDER;
}

for (i = l = 1; l <= 340; i = ++l) {
  if ((i & 0x7) === 1 || i === 339) {
    cycleFlagsTable[i] |= F_FETCH_NT;
  }
}

for (i = m = 0; m <= 261; i = ++m) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_NT;
  }
}

for (i = n = 1; n <= 340; i = ++n) {
  if ((i & 0x7) === 3) {
    cycleFlagsTable[i] |= F_FETCH_AT;
  }
}

for (i = o = 0; o <= 261; i = ++o) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_AT;
  }
}

for (i = p = 1; p <= 340; i = ++p) {
  if ((i & 0x7) === 5 && !((257 < i && i < 321))) {
    cycleFlagsTable[i] |= F_FETCH_BGL;
  }
}

for (i = q = 0; q <= 261; i = ++q) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_BGL;
  }
}

for (i = s = 1; s <= 340; i = ++s) {
  if ((i & 0x7) === 7 && !((257 < i && i < 321))) {
    cycleFlagsTable[i] |= F_FETCH_BGH;
  }
}

for (i = t = 0; t <= 261; i = ++t) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_BGH;
  }
}

for (i = u = 257; u <= 320; i = ++u) {
  if ((i & 0x7) === 5) {
    cycleFlagsTable[i] |= F_FETCH_SPL;
  }
}

for (i = v = 0; v <= 261; i = ++v) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_SPL;
  }
}

for (i = w = 257; w <= 320; i = ++w) {
  if ((i & 0x7) === 7) {
    cycleFlagsTable[i] |= F_FETCH_SPH;
  }
}

for (i = z = 0; z <= 261; i = ++z) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_FETCH_SPH;
  }
}

for (i = aa = 9; aa <= 340; i = ++aa) {
  if ((i & 0x7) === 1 && ((i < 258) || (i === 329 || i === 337))) {
    cycleFlagsTable[i] |= F_COPY_BG;
  }
}

for (i = ab = 0; ab <= 261; i = ++ab) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_COPY_BG;
  }
}

for (i = ac = 1; ac <= 336; i = ++ac) {
  if (!((256 < i && i < 321))) {
    cycleFlagsTable[i] |= F_SHIFT_BG;
  }
}

for (i = ad = 0; ad <= 239; i = ++ad) {
  scanlineFlagsTable[i] |= F_SHIFT_BG;
}

cycleFlagsTable[65] |= F_EVAL_SP;

for (i = ae = 0; ae <= 261; i = ++ae) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_EVAL_SP;
  }
}

for (i = af = 1; af <= 8; i = ++af) {
  cycleFlagsTable[i] |= F_CLIP_LEFT;
}

for (i = ag = 0; ag <= 239; i = ++ag) {
  scanlineFlagsTable[i] |= F_CLIP_LEFT;
}

for (i = ah = 1; ah <= 256; i = ++ah) {
  cycleFlagsTable[i] |= F_CLIP_NTSC;
}

for (i = ai = 0; ai <= 239; i = ++ai) {
  if (!((7 < i && i < 232))) {
    scanlineFlagsTable[i] |= F_CLIP_NTSC;
  }
}

for (i = aj = 8; aj <= 336; i = ++aj) {
  if (!(i & 0x7) && !((256 < i && i < 328))) {
    cycleFlagsTable[i] |= F_INC_CX;
  }
}

for (i = ak = 0; ak <= 261; i = ++ak) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_INC_CX;
  }
}

cycleFlagsTable[256] |= F_INC_FY;

for (i = al = 0; al <= 261; i = ++al) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_INC_FY;
  }
}

cycleFlagsTable[257] |= F_COPY_HS;

for (i = am = 0; am <= 261; i = ++am) {
  if (!((239 < i && i < 261))) {
    scanlineFlagsTable[i] |= F_COPY_HS;
  }
}

for (i = an = 280; an <= 304; i = ++an) {
  cycleFlagsTable[i] |= F_COPY_VS;
}

scanlineFlagsTable[261] |= F_COPY_VS;

cycleFlagsTable[1] |= F_VB_START;

scanlineFlagsTable[241] |= F_VB_START;

for (i = ao = 1; ao <= 3; i = ++ao) {
  cycleFlagsTable[i] |= F_VB_START2;
}

scanlineFlagsTable[241] |= F_VB_START2;

cycleFlagsTable[1] |= F_VB_END;

scanlineFlagsTable[261] |= F_VB_END;

cycleFlagsTable[338] |= F_SKIP;

scanlineFlagsTable[261] |= F_SKIP;

function Sprite() {
  this.x = 0;
  this.zeroSprite = false;
  this.horizontalFlip = false;
  this.paletteNumber = 0;
  this.inFront = false;
  this.patternRowAddress = 0;
  this.patternRow0 = 0;
  this.patternRow1 = 0;
}

export function PPU() {}

PPU["dependencies"] = [ "ppuMemory", "cpu" ];

PPU.prototype.init = function(ppuMemory, cpu) {
  this.ppuMemory = ppuMemory;
  this.cpu = cpu;
  this.ntscMode = true;
  return this.colorEmphasis = 0;
};

PPU.prototype.powerUp = function() {
  logger.info("Reseting PPU");
  this.resetOAM();
  this.resetRegisters();
  return this.resetVariables();
};

PPU.prototype.resetOAM = function() {
  this.primaryOAM = newUint8Array(0x100);
  return this.secondaryOAM = (function() {
    var ap, results;
    results = [];
    for (ap = 0; ap <= 7; ap++) {
      results.push(new Sprite);
    }
    return results;
  })();
};

PPU.prototype.resetRegisters = function() {
  this.setControl(0);
  this.setMask(0);
  this.setStatus(0);
  this.oamAddress = 0;
  this.tempAddress = 0;
  this.vramAddress = 0;
  this.vramReadBuffer = 0;
  this.writeToogle = 0;
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
  return this.paletteLatchNext1 = 0;
};

PPU.prototype.resetVariables = function() {
  this.scanline = 261;
  this.cycle = 0;
  this.cycleFlags = 0;
  this.suppressVBlank = false;
  this.supressNMI = false;
  this.nmiDelay = 0;
  this.oddFrame = false;
  this.spriteCount = 0;
  this.spriteNumber = 0;
  this.spriteCache = (function() {
    var ap, results;
    results = [];
    for (ap = 0; ap <= 261; ap++) {
      results.push(null);
    }
    return results;
  })();
  return this.spritePixelCache = newUint8Array(261);
};

PPU.prototype.setNTSCMode = function(ntscMode) {
  return this.ntscMode = ntscMode;
};

PPU.prototype.setRGBPalette = function(rgbPalette) {
  this.createRGBAPalettes(rgbPalette);
  return this.updateRGBAPalette();
};

PPU.prototype.createRGBAPalettes = function(rgbPalette) {
  var bRatio, colorEmphasis, gRatio, rRatio;
  return this.rgbaPalettes = (function() {
    var ap, results;
    results = [];
    for (colorEmphasis = ap = 0; ap <= 7; colorEmphasis = ++ap) {
      rRatio = colorEmphasis & 6 ? 0.75 : 1.0;
      gRatio = colorEmphasis & 5 ? 0.75 : 1.0;
      bRatio = colorEmphasis & 3 ? 0.75 : 1.0;
      results.push(this.createRGBAPalette(rgbPalette, rRatio, gRatio, bRatio));
    }
    return results;
  }).call(this);
};

PPU.prototype.createRGBAPalette = function(rgbPalette, rRatio, gRatio, bRatio) {
  var ap, b, g, len, r, rgb, rgbaPalette;
  rgbaPalette = new Array(rgbPalette.length);
  for (i = ap = 0, len = rgbPalette.length; ap < len; i = ++ap) {
    rgb = rgbPalette[i];
    r = Math.floor(rRatio * ((rgb >>> 16) & 0xFF));
    g = Math.floor(gRatio * ((rgb >>> 8) & 0xFF));
    b = Math.floor(bRatio * (rgb & 0xFF));
    rgbaPalette[i] = packColor(r, g, b);
  }
  return rgbaPalette;
};

PPU.prototype.updateRGBAPalette = function() {
  return this.rgbaPalette = this.rgbaPalettes[this.colorEmphasis];
};

PPU.prototype.writeControl = function(value) {
  var nmiEnabledOld;
  nmiEnabledOld = this.nmiEnabled;
  this.setControl(value);
  this.tempAddress = (this.tempAddress & 0xF3FF) | (value & 0x03) << 10;
  if (this.vblankFlag && !nmiEnabledOld && this.nmiEnabled && !(this.cycleFlags & F_VB_END)) {
    this.nmiDelay = 1;
  }
  return value;
};

PPU.prototype.setControl = function(value) {
  this.bigAddressIncrement = (value >>> 2) & 1;
  this.spPatternTableAddress = (value << 9) & 0x1000;
  this.bgPatternTableAddress = (value << 8) & 0x1000;
  this.bigSprites = (value >>> 5) & 1;
  return this.nmiEnabled = value >>> 7;
};

PPU.prototype.writeMask = function(value) {
  this.setMask(value);
  this.updateRGBAPalette();
  return value;
};

PPU.prototype.setMask = function(value) {
  this.monochromeMode = value & 1;
  this.backgroundClipping = !((value >>> 1) & 1);
  this.spriteClipping = !((value >>> 2) & 1);
  this.backgroundVisible = (value >>> 3) & 1;
  this.spritesVisible = (value >>> 4) & 1;
  return this.colorEmphasis = (value >>> 5) & 7;
};

PPU.prototype.readStatus = function() {
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
};

PPU.prototype.getStatus = function() {
  return this.spriteOverflow << 5 | this.spriteZeroHit << 6 | this.vblankFlag << 7;
};

PPU.prototype.setStatus = function(value) {
  this.spriteOverflow = (value >>> 5) & 1;
  this.spriteZeroHit = (value >>> 6) & 1;
  return this.vblankFlag = value >>> 7;
};

PPU.prototype.writeOAMAddress = function(address) {
  return this.oamAddress = address;
};

PPU.prototype.readOAMData = function() {
  var value;
  value = this.primaryOAM[this.oamAddress];
  if ((this.oamAddress & 0x03) === 2) {
    value &= 0xE3;
  }
  return value;
};

PPU.prototype.writeOAMData = function(value) {
  if (!this.isRenderingActive()) {
    this.primaryOAM[this.oamAddress] = value;
  }
  this.oamAddress = (this.oamAddress + 1) & 0xFF;
  return value;
};

PPU.prototype.writeAddress = function(address) {
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
};

PPU.prototype.readData = function() {
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
};

PPU.prototype.writeData = function(value) {
  if (!this.isRenderingActive()) {
    this.ppuMemory.write(this.vramAddress, value);
  }
  this.incrementAddress();
  return value;
};

PPU.prototype.incrementAddress = function() {
  return this.vramAddress = (this.vramAddress + this.getAddressIncrement()) & 0xFFFF;
};

PPU.prototype.getAddressIncrement = function() {
  if (this.bigAddressIncrement) {
    return 0x20;
  } else {
    return 0x01;
  }
};

PPU.prototype.isPaletteAddress = function(address) {
  return (address & 0x3F00) === 0x3F00;
};

PPU.prototype.writeScroll = function(value) {
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
};

PPU.prototype.updateScrolling = function() {
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
};

PPU.prototype.copyHorizontalScrollBits = function() {
  return this.vramAddress = (this.vramAddress & 0x7BE0) | (this.tempAddress & 0x041F);
};

PPU.prototype.copyVerticalScrollBits = function() {
  return this.vramAddress = (this.vramAddress & 0x041F) | (this.tempAddress & 0x7BE0);
};

PPU.prototype.incrementCoarseXScroll = function() {
  if ((this.vramAddress & 0x001F) === 0x001F) {
    this.vramAddress &= 0xFFE0;
    return this.vramAddress ^= 0x0400;
  } else {
    return this.vramAddress += 0x0001;
  }
};

PPU.prototype.incrementFineYScroll = function() {
  if ((this.vramAddress & 0x7000) === 0x7000) {
    this.vramAddress &= 0x0FFF;
    return this.incrementCoarseYScroll();
  } else {
    return this.vramAddress += 0x1000;
  }
};

PPU.prototype.incrementCoarseYScroll = function() {
  if ((this.vramAddress & 0x03E0) === 0x03E0) {
    return this.vramAddress &= 0xFC1F;
  } else if ((this.vramAddress & 0x03E0) === 0x03A0) {
    this.vramAddress &= 0xFC1F;
    return this.vramAddress ^= 0x0800;
  } else {
    return this.vramAddress += 0x0020;
  }
};

PPU.prototype.startFrame = function(buffer) {
  this.framePosition = 0;
  this.frameBuffer = buffer;
  return this.frameAvailable = false;
};

PPU.prototype.isFrameAvailable = function() {
  return this.frameAvailable;
};

PPU.prototype.isBrightFramePixel = function(x, y) {
  var b, g, r, ref;
  if (y < this.scanline - 5 || y >= this.scanline) {
    return false;
  }
  ref = unpackColor(this.frameBuffer[y * VIDEO_WIDTH + x]), r = ref[0], g = ref[1], b = ref[2];
  return r > 0x12 || g > 0x12 || b > 0x12;
};

PPU.prototype.setFramePixel = function(color) {
  return this.frameBuffer[this.framePosition++] = this.rgbaPalette[color];
};

PPU.prototype.setFramePixelOnPosition = function(x, y, color) {
  return this.frameBuffer[y * VIDEO_WIDTH + x] = this.rgbaPalette[color];
};

PPU.prototype.clearFramePixel = function() {
  return this.frameBuffer[this.framePosition++] = BLACK_COLOR;
};

PPU.prototype.updateVBlank = function() {
  if (this.nmiDelay && !--this.nmiDelay && this.nmiEnabled && !this.supressNMI) {
    this.cpu.activateInterrupt(Interrupt.NMI);
  }
  if (this.cycleFlags & F_VB_START) {
    return this.enterVBlank();
  } else if (this.cycleFlags & F_VB_END) {
    return this.leaveVBlank();
  }
};

PPU.prototype.enterVBlank = function() {
  this.vblankActive = true;
  if (!this.suppressVBlank) {
    this.vblankFlag = 1;
  }
  this.nmiDelay = 2;
  return this.frameAvailable = true;
};

PPU.prototype.leaveVBlank = function() {
  this.vblankActive = false;
  this.vblankFlag = 0;
  this.suppressVBlank = false;
  this.supressNMI = false;
  return this.spriteZeroHit = 0;
};

PPU.prototype.incrementCycle = function() {
  if ((this.cycleFlags & F_SKIP) && this.oddFrame && this.isRenderingEnabled()) {
    this.cycle++;
  }
  this.cycle++;
  if (this.cycle > 340) {
    this.incrementScanline();
  }
  return this.cycleFlags = cycleFlagsTable[this.cycle] & scanlineFlagsTable[this.scanline];
};

PPU.prototype.incrementScanline = function() {
  var ref;
  this.cycle = 0;
  this.scanline++;
  if (this.scanline > 261) {
    this.incrementFrame();
  }
  if ((0 <= (ref = this.scanline) && ref <= 239)) {
    return this.prerenderSprites();
  }
};

PPU.prototype.incrementFrame = function() {
  this.scanline = 0;
  return this.oddFrame = !this.oddFrame;
};

PPU.prototype.tick = function() {
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
};

PPU.prototype.fetchData = function() {
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
};

PPU.prototype.isRenderingActive = function() {
  return !this.vblankActive && this.isRenderingEnabled();
};

PPU.prototype.isRenderingEnabled = function() {
  return this.spritesVisible || this.backgroundVisible;
};

PPU.prototype.updateFramePixel = function() {
  var address, color;
  if (this.ntscMode && this.cycleFlags & F_CLIP_NTSC) {
    return this.clearFramePixel();
  } else {
    address = this.renderFramePixel();
    color = this.ppuMemory.readPalette(address);
    return this.setFramePixel(color);
  }
};

PPU.prototype.renderFramePixel = function() {
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
};

PPU.prototype.fetchNametable = function() {
  var fineYScroll, patternAddress, patternNumer;
  this.addressBus = 0x2000 | this.vramAddress & 0x0FFF;
  patternNumer = this.ppuMemory.readNameAttr(this.addressBus);
  patternAddress = this.bgPatternTableAddress + (patternNumer << 4);
  fineYScroll = (this.vramAddress >>> 12) & 0x07;
  return this.patternRowAddress = patternAddress + fineYScroll;
};

PPU.prototype.fetchAttribute = function() {
  var areaNumber, attribute, attributeNumber, attributeTableAddress, paletteNumber;
  attributeTableAddress = 0x23C0 | this.vramAddress & 0x0C00;
  attributeNumber = (this.vramAddress >>> 4) & 0x38 | (this.vramAddress >>> 2) & 0x07;
  this.addressBus = attributeTableAddress + attributeNumber;
  attribute = this.ppuMemory.readNameAttr(this.addressBus);
  areaNumber = (this.vramAddress >>> 4) & 0x04 | this.vramAddress & 0x02;
  paletteNumber = (attribute >>> areaNumber) & 0x03;
  this.paletteLatchNext0 = paletteNumber & 1;
  return this.paletteLatchNext1 = (paletteNumber >>> 1) & 1;
};

PPU.prototype.fetchBackgroundLow = function() {
  this.addressBus = this.patternRowAddress;
  return this.patternBufferNext0 = this.ppuMemory.readPattern(this.addressBus);
};

PPU.prototype.fetchBackgroundHigh = function() {
  this.addressBus = this.patternRowAddress + 8;
  return this.patternBufferNext1 = this.ppuMemory.readPattern(this.addressBus);
};

PPU.prototype.copyBackground = function() {
  this.patternBuffer0 |= this.patternBufferNext0;
  this.patternBuffer1 |= this.patternBufferNext1;
  this.paletteLatch0 = this.paletteLatchNext0;
  return this.paletteLatch1 = this.paletteLatchNext1;
};

PPU.prototype.shiftBackground = function() {
  this.patternBuffer0 = this.patternBuffer0 << 1;
  this.patternBuffer1 = this.patternBuffer1 << 1;
  this.paletteBuffer0 = (this.paletteBuffer0 << 1) | this.paletteLatch0;
  return this.paletteBuffer1 = (this.paletteBuffer1 << 1) | this.paletteLatch1;
};

PPU.prototype.renderBackgroundPixel = function() {
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
};

PPU.prototype.isBackgroundPixelVisible = function() {
  return this.backgroundVisible && !(this.backgroundClipping && (this.cycleFlags & F_CLIP_LEFT));
};

PPU.prototype.evaluateSprites = function() {
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
};

PPU.prototype.fetchSpriteLow = function() {
  var sprite;
  if (this.spriteNumber < this.spriteCount) {
    sprite = this.secondaryOAM[this.spriteNumber];
    this.addressBus = sprite.patternRowAddress;
    return sprite.patternRow0 = this.ppuMemory.readPattern(this.addressBus);
  } else {
    return this.addressBus = this.spPatternTableAddress | 0x0FF0;
  }
};

PPU.prototype.fetchSpriteHigh = function() {
  var sprite;
  if (this.spriteNumber < this.spriteCount) {
    sprite = this.secondaryOAM[this.spriteNumber++];
    this.addressBus = sprite.patternRowAddress + 8;
    return sprite.patternRow1 = this.ppuMemory.readPattern(this.addressBus);
  } else {
    return this.addressBus = this.spPatternTableAddress | 0x0FF0;
  }
};

PPU.prototype.prerenderSprites = function() {
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
};

PPU.prototype.renderSpritePixel = function() {
  if (this.isSpritePixelVisible()) {
    return this.spritePixelCache[this.cycle];
  } else {
    return 0;
  }
};

PPU.prototype.isSpritePixelVisible = function() {
  return this.spritesVisible && !(this.spriteClipping && (this.cycleFlags & F_CLIP_LEFT));
};

PPU.prototype.getRenderedSprite = function() {
  return this.spriteCache[this.cycle];
};

PPU.prototype.renderDebugFrame = function() {
  this.renderPatterns();
  return this.renderPalettes();
};

PPU.prototype.renderPatterns = function() {
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
};

PPU.prototype.renderPatternTile = function(baseX, baseY, address) {
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
};

PPU.prototype.renderPalettes = function() {
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
};

PPU.prototype.renderPaletteTile = function(baseX, baseY, color) {
  var ap, aq, ref, ref1, ref2, ref3, x, y;
  for (y = ap = ref = baseY, ref1 = baseY + 28; ref <= ref1 ? ap < ref1 : ap > ref1; y = ref <= ref1 ? ++ap : --ap) {
    for (x = aq = ref2 = baseX, ref3 = baseX + 32; ref2 <= ref3 ? aq < ref3 : aq > ref3; x = ref2 <= ref3 ? ++aq : --aq) {
      this.setFramePixelOnPosition(x, y, color);
    }
  }
  return void 0;
};

PPU.prototype.connectMapper = function(mapper) {
  return this.mapper = mapper;
};
