import {BusConnected, MapperConnected, Resettable} from '../common'; // eslint-disable-line no-unused-vars

/**
 * CPU memory interface.
 * @interface
 * @extends {BusConnected}
 * @extends {MapperConnected}
 * @extends {Resettable}
 */
export default class CpuMemoryInterface {

  /**
   * Reads value from an address.
   * @param {number} address Address (16-bit).
   * @returns {number} Read value (8-bit).
   */
  read(address) { // eslint-disable-line no-unused-vars
  }

  /**
   * Writes value to an address.
   * @param {number} address Address (16-bit).
   * @param {number} value Value to write (8-bit).
   */
  write(address, value) { // eslint-disable-line no-unused-vars
  }

  /*
  getInputDevice() {
  }

  setInputDevice() {
  }

  TODO move to mapper implementation
  mapPrgRamBank() {
  }

  TODO move to mapper implementation
  mapPrgRomBank() {
  }
  */

}
