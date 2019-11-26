import BusComponent from '../common/BusComponent'; // eslint-disable-line no-unused-vars

/**
 * Input device interface.
 * @interface
 * @extends {BusComponent}
 */
export default class InputDevice {

  /**
   * Sends strobe signal to device.
   */
  strobe() {
  }

  /**
   * Reads value from device.
   * @returns {number} Value.
   */
  read() {
  }

}
