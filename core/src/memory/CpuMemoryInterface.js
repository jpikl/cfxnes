import BusComponent from '../common/BusComponent'; // eslint-disable-line no-unused-vars

/**
 * CPU memory interface.
 * @interface
 * @extends {BusComponent}
 */
export default class CpuMemoryInterface {

  /**
   * Reads value from an address.
   * @param {number} address Address (16-bit).
   * @returns {value} Read value (8-bit).
   */
  read(address) { // eslint-disable-line no-unused-vars
  }

  /**
   * Writes value to an address.
   * @param {number} address Address (16-bit).
   * @param {value} value Value to write (8-bit).
   */
  write(address, value) { // eslint-disable-line no-unused-vars
  }

}
