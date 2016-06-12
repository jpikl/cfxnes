import PPU from '../PPU';

export default class DisabledPPU extends PPU {

  tick() {
    // For faster execution when PPU is not needed
  }

  updatePalette() {
  }

}
