import {Button, describe} from '../../../../core';

const buttons = {
  'a': Button.A,
  'b': Button.B,
  'select': Button.SELECT,
  'start': Button.START,
  'up': Button.UP,
  'down': Button.DOWN,
  'left': Button.LEFT,
  'right': Button.RIGHT,
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
        throw new Error('Invalid joypad button state: ' + describe(value));
      }
      this.joypad.setButtonPressed(buttons[name], value);
    } else {
      throw new Error('Invalid joypad button: ' + describe(name));
    }
  }

  getInput(name) {
    if (name in buttons) {
      return this.joypad.isButtonPressed(buttons[name]);
    }
    throw new Error('Invalid joypad button: ' + describe(name));
  }

}
