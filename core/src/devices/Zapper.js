import {log} from '../common';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../video';
import Bus from '../common/Bus'; // eslint-disable-line no-unused-vars
import BusComponent from '../common/BusComponent'; // eslint-disable-line no-unused-vars
import PpuInterface from '../video/PpuInterface'; // eslint-disable-line no-unused-vars

/**
 * Light gun controller - Zapper.
 * @implements {BusComponent}
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
   *
   * @param {!Bus} bus.
   */
  connect(bus) {
    log.info('Connecting zapper');
    this.ppu = bus.getPpu();
  }

  /**
   * Disconnects zapper from bus.
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
   * @returns {number} Value.
   */
  read() {
    return (this.triggerPressed << 4) | (!this.isLightDetected() << 3);
  }

  /**
   * Returns whether zapper is detecting bright area on screen.
   * @returns {boolean} True if bright area is detected, false otherwise.
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
   * @returns {boolean} True if trigger is pressed, false otherwise.
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
   * @returns {!Array<number>} Array containing X and Y coordinate.
   */
  getBeamPosition() {
    return [this.beamX, this.beamY];
  }

}
