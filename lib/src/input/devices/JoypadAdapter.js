import {toString} from '../../../../core/src/common';
import {Button} from '../../../../core/src/devices';

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
        throw new Error('Invalid joypad button state: ' + toString(value));
      }
      this.joypad.setButtonPressed(buttons[name], value);
    } else {
      throw new Error('Invalid joypad button: ' + toString(name));
    }
  }

  getInput(name) {
    if (name in buttons) {
      return this.joypad.isButtonPressed(buttons[name]);
    }
    throw new Error('Invalid joypad button: ' + toString(name));
  }

}
