import BusComponent from '../common/BusComponent'; // eslint-disable-line no-unused-vars

/**
 * PPU interface.
 * @interface
 * @extends {BusComponent}
 */
export default class PpuInterface {

  /**
   * Returns whether point on screen is bright.
   * @param {number} x X screen coordinate.
   * @param {number} y Y screen coordinate.
   * @returns {boolean} True if the point is bright, false otherwise.
   */
  isBrightFramePixel(x, y) { // eslint-disable-line no-unused-vars
  }

}
