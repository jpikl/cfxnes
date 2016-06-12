import PPU from '../PPU';

//=========================================================
// PPU with disabled output generation
//=========================================================

export default class NoOutputPPU extends PPU {

  constructor() {
    super();
    this.setFrameBuffer([]); // This surprisingly makes execution in Node.js faster, although the buffer isn't accessed at all
  }

  updatePalette() {
  }

  setFramePixel() {
  }

  clearFramePixel() {
  }

}
