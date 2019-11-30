import BusConnected from '../common/BusConnected'; // eslint-disable-line no-unused-vars

/**
 * Input device interface.
 * @interface
 * @extends {BusConnected}
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
