//=========================================================
// Zapper input device
//=========================================================

export default class Zapper {

  constructor() {
    this.dependencies = ['ppu'];
    this.triggerPressed = false;
    this.beamX = 0;
    this.beamY = 0;
  }

  inject(ppu) {
    this.ppu = ppu;
  }

  strobe() {
  }

  read() {
    return this.triggerPressed << 4 | !this.isLightDetected() << 3;
  }

  isLightDetected() {
    return this.beamX && this.beamY
      && this.ppu.isBrightFramePixel(this.beamX, this.beamY);
  }

  setTriggerPressed(pressed) {
    this.triggerPressed = pressed;
  }

  setBeamPosition(x, y) {
    this.beamX = x;
    this.beamY = y;
  }

}
