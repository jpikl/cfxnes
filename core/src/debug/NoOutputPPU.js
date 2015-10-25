import PPU from '../units/PPU';

//=========================================================
// PPU with disabled output generation
//=========================================================

export default class NoOutputPPU extends PPU {

  updatePalette() {
  }

  setFramePixel() {
  }

  clearFramePixel() {
  }

}
