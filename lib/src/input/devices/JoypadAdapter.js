import {JoypadButton, describeValue} from '../../../../core';

const buttons = {
  'a': JoypadButton.A,
  'b': JoypadButton.B,
  'select': JoypadButton.SELECT,
  'start': JoypadButton.START,
  'up': JoypadButton.UP,
  'down': JoypadButton.DOWN,
  'left': JoypadButton.LEFT,
  'right': JoypadButton.RIGHT,
};

export default class JoypadAdapter {

  constructor(joypad) {
    this.joypad = joypad;
  }

  getDevice() {
    return this.joypad;
  }

  setInput(name, value) {
    if (name in buttons) {
      if (typeof value !== 'boolean') {
        throw new Error('Invalid joypad button state: ' + describeValue(value));
      }
      this.joypad.setButtonPressed(buttons[name], value);
    } else {
      throw new Error('Invalid joypad button: ' + describeValue(name));
    }
  }

  getInput(name) {
    if (name in buttons) {
      return this.joypad.isButtonPressed(buttons[name]);
    }
    throw new Error('Invalid joypad button: ' + describeValue(name));
  }

}
