import {log} from '../common';

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

export default class Joypad {

  constructor() {
    this.buttonStates = new Uint8Array(24);
    this.buttonStates[19] = 1;
    this.readPosition = 0;
  }

  connect() {
    log.info('Connecting joypad');
  }

  disconnect() {
    log.info('Disconnecting joypad');
  }

  strobe() {
    this.readPosition = 0;
  }

  read() {
    const state = this.buttonStates[this.readPosition];
    this.readPosition = (this.readPosition + 1) % this.buttonStates.length;
    return state;
  }

  setButtonPressed(button, pressed) {
    this.buttonStates[button] = pressed ? 1 : 0;
  }

  isButtonPressed(button) {
    return this.buttonStates[button] === 1;
  }

}
