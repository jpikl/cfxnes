import {log} from '../common';
import JoypadButton from './JoypadButton';
import InputDevice from './InputDevice';

/**
 * Standard controller - Joypad.
 * @implements {InputDevice}
 */
export default class Joypad {

  /**
   * Constructor.
   */
  constructor() {
    /**
     * Memory containing state of all buttons.
     * @private {!Uint8Array}
     * @const
     */
    this.buttonStates = new Uint8Array(24);
    this.buttonStates[19] = 1;

    /**
     * Reading position in memory.
     * @private {number}
     */
    this.readPosition = 0;
  }

  /**
   * Connects joypad to bus.
   * @override
   */
  connectToBus() {
    log.info('Connecting joypad');
  }

  /**
   * Disconnects joypad from bus.
   * @override
   */
  disconnectFromBus() {
    log.info('Disconnecting joypad');
  }

  /**
   * Sends strobe signal to joypad.
   * @override
   */
  strobe() {
    this.readPosition = 0;
  }

  /**
   * Reads value from joypad.
   * @return {number} Value.
   * @override
   */
  read() {
    const state = this.buttonStates[this.readPosition];
    this.readPosition = (this.readPosition + 1) % this.buttonStates.length;
    return state;
  }

  /**
   * Sets state of a button.
   * @param {JoypadButton} button Button.
   * @param {boolean} pressed True if button is pressed, false otherwise.
   */
  setButtonPressed(button, pressed) {
    this.buttonStates[button] = pressed ? 1 : 0;
  }

  /**
   * Returns state of a button.
   * @param {JoypadButton} button Button.
   * @return {boolean} True if button is pressed, false otherwise.
   */
  isButtonPressed(button) {
    return this.buttonStates[button] === 1;
  }

}
