export default class Sprite {

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
