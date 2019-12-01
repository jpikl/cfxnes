import {BusConnected} from '../common';

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
   * @return {number} Value.
   */
  read() {
  }

}
