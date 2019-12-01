import {Bus, log} from '../common';
import {VIDEO_WIDTH, VIDEO_HEIGHT, PpuInterface} from '../video';
import InputDevice from './InputDevice';

/**
 * Light gun controller - Zapper.
 * @implements {InputDevice}
 */
export default class Zapper {

  /**
   * Constructor.
   */
  constructor() {
    /**
     * Trigger button state.
     * @private {boolean}
     */
    this.triggerPressed = false;

    /**
     * Beam X coordinate on screen.
     * @private {number}
     */
    this.beamX = -1;

    /**
     * Beam Y coordinate on screen.
     * @private {number}
     */
    this.beamY = -1;

    /**
     * PPU interface.
     * @private {PpuInterface}
     */
    this.ppu = null;
  }

  /**
   * Connects zapper to bus.
   * @param {!Bus} bus Bus.
   * @override
   */
  connectToBus(bus) {
    log.info('Connecting zapper to bus');
    this.ppu = bus.getPpu();
  }

  /**
   * Disconnects zapper from bus.
   * @override
   */
  disconnectFromBus() {
    log.info('Disconnecting zapper from bus');
    this.ppu = null;
  }

  /**
   * Sends strobe signal to zapper.
   * @override
   */
  strobe() {
    // Ignored
  }

  /**
   * Reads value from zapper.
   * @return {number} Value.
   * @override
   */
  read() {
    return (this.triggerPressed << 4) | (!this.isLightDetected() << 3);
  }

  /**
   * Returns whether zapper is detecting bright area on screen.
   * @return {boolean} True if bright area is detected, false otherwise.
   */
  isLightDetected() {
    return this.beamX >= 0 && this.beamX < VIDEO_WIDTH
      && this.beamY >= 0 && this.beamY < VIDEO_HEIGHT
      && this.ppu.isBrightFramePixel(this.beamX, this.beamY);
  }

  /**
   * Sets trigger button state.
   * @param {boolean} pressed True if trigger is pressed, false otherwise.
   */
  setTriggerPressed(pressed) {
    this.triggerPressed = pressed;
  }

  /**
   * Returns trigger button state.
   * @return {boolean} True if trigger is pressed, false otherwise.
   */
  isTriggerPressed() {
    return this.triggerPressed;
  }

  /**
   * Sets beam position on screen.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   */
  setBeamPosition(x, y) {
    this.beamX = x;
    this.beamY = y;
  }

  /**
   * Returns beam position on screen.
   * @return {!Array<number>} Array containing X and Y coordinate.
   */
  getBeamPosition() {
    return [this.beamX, this.beamY];
  }

}
