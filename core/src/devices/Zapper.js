import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../video/resolution';
import log from '../common/log';

export default class Zapper {

  constructor() {
    this.triggerPressed = false;
    this.beamX = -1;
    this.beamY = -1;
  }

  connect(nes) {
    log.info('Connecting zapper');
    this.ppu = nes.ppu;
  }

  disconnect() {
    log.info('Disconnecting zapper');
    this.ppu = undefined;
  }

  strobe() {
  }

  read() {
    return this.triggerPressed << 4 | !this.isLightDetected() << 3;
  }

  isLightDetected() {
    return this.beamX >= 0 && this.beamX < VIDEO_WIDTH
        && this.beamY >= 0 && this.beamY < VIDEO_HEIGHT
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
