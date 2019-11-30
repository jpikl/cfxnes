import BusConnected from '../common/BusConnected'; // eslint-disable-line no-unused-vars
import Resettable from '../common/Resettable'; // eslint-disable-line no-unused-vars
import Ticking from '../common/Ticking'; // eslint-disable-line no-unused-vars

/**
 * PPU interface.
 * @interface
 * @extends {BusConnected}
 * @extends {Resettable}
 * @extends {Ticking}
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

  /*
  isFrameAvailable() {
  }

  readData() {
  }

  readOamData() {
  }

  readStatus() {
  }

  renderDebugFrame() {
  }

  getBasePalette() {
  }

  setBasePalette() {
  }

  setFrameBuffer() {
  }

  setRegionParams() {
  }

  writeAddress() {
  }

  writeControl() {
  }

  writeData() {
  }

  writeMask() {
  }

  writeOamAddress() {
  }

  writeOamData() {
  }

  writeScroll() {
  }
  */

}
