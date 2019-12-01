import {BusConnected, Resettable, Ticking} from '../common';

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
   * @return {boolean} True if the point is bright, false otherwise.
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
