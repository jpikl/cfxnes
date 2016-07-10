import log from '../common/log';

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

// Buttons - must be specified using string key (closure compiler issue)
Joypad['A'] = 0;
Joypad['B'] = 1;
Joypad['SELECT'] = 2;
Joypad['START'] = 3;
Joypad['UP'] = 4;
Joypad['DOWN'] = 5;
Joypad['LEFT'] = 6;
Joypad['RIGHT'] = 7;
