import {log} from '../common';

/**
 * Joypad button.
 *
 * @enum {number}
*/
export const Button = {
  A: 0,
  B: 1,
  SELECT: 2,
  START: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7,
};

/**
 * Standard controller aka Joypad.
 */
export default class Joypad {

  /**
   * Constructor.
   */
  constructor() {
    /** @private @const {!Uint8Array} Memory containing state of all buttons. */
    this.buttonStates = new Uint8Array(24);
    this.buttonStates[19] = 1;
    /** @private {number} Current reading position in memory. */
    this.readPosition = 0;
  }

  /**
   * Connects joypad to NES.
   */
  connect() {
    log.info('Connecting joypad');
  }

  /**
   * Disconnects joypad from NES.
   */
  disconnect() {
    log.info('Disconnecting joypad');
  }

  /**
   * Sends strobe signal to joypad.
   */
  strobe() {
    this.readPosition = 0;
  }

  /**
   * Reads value from joypad.
   *
   * @returns {number} Value.
   */
  read() {
    const state = this.buttonStates[this.readPosition];
    this.readPosition = (this.readPosition + 1) % this.buttonStates.length;
    return state;
  }

  /**
   * Sets state of a button.
   *
   * @param {Button} button Button.
   * @param {boolean} pressed True if button is pressed, false otherwise.
   */
  setButtonPressed(button, pressed) {
    this.buttonStates[button] = pressed ? 1 : 0;
  }

  /**
   * Returns state of a button.
   *
   * @param {Button} button Button.
   * @returns {boolean} True if button is pressed, false otherwise/
   */
  isButtonPressed(button) {
    return this.buttonStates[button] === 1;
  }

}
