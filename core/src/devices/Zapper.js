import {log} from '../common';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../video';

/**
 * Light gun controller aka Zapper.
 */
export default class Zapper {

  /**
   * Constructor.
   */
  constructor() {
    /** @type {boolean} trigger button state */
    this.triggerPressed = false;
    /** @type {number} beam X coordinate on screen */
    this.beamX = -1;
    /** @type {number} beam Y coordinate on screen */
    this.beamY = -1;
    /** @type {?Object} PPU */
    this.ppu = null;
  }

  /**
   * Connects zapper to NES.
   *
   * @param {!Object} nes - NES
   */
  connect(nes) {
    log.info('Connecting zapper');
    this.ppu = nes.ppu;
  }

  /**
   * Disconnects zapper from NES.
   */
  disconnect() {
    log.info('Disconnecting zapper');
    this.ppu = null;
  }

  /**
   * Sends strobe signal to zapper.
   */
  strobe() {
    // Ignored
  }

  /**
   * Reads value from zapper.
   *
   * @returns {number} value
   */
  read() {
    return (this.triggerPressed << 4) | (!this.isLightDetected() << 3);
  }

  /**
   * Checks whether zapper is detecting bright area on screen.
   *
   * @returns {boolean} true if bright area is detected, false otherwise
   */
  isLightDetected() {
    return this.beamX >= 0 && this.beamX < VIDEO_WIDTH
        && this.beamY >= 0 && this.beamY < VIDEO_HEIGHT
        && this.ppu.isBrightFramePixel(this.beamX, this.beamY);
  }

  /**
   * Sets trigger button state.
   *
   * @param {boolean} pressed - true if trigger is pressed, false otherwise
   */
  setTriggerPressed(pressed) {
    this.triggerPressed = pressed;
  }

  /**
   * Returns trigger button state.
   *
   * @returns {boolean} - true if trigger is pressed, false otherwise
   */
  isTriggerPressed() {
    return this.triggerPressed;
  }

  /**
   * Sets beam position on screen.
   *
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setBeamPosition(x, y) {
    this.beamX = x;
    this.beamY = y;
  }

  /**
   * Returns beam position on screen.
   *
   * @returns {!Array<number>} array containing X and Y coordinate
   */
  getBeamPosition() {
    return [this.beamX, this.beamY];
  }

}
