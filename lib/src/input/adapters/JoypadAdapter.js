import {toString} from '../../../../core/src/common/utils';
import Joypad from '../../../../core/src/devices/Joypad';

const buttons = {
  'a': Joypad['A'], // Must be specified using string key (closure compiler issue)
  'b': Joypad['B'],
  'select': Joypad['SELECT'],
  'start': Joypad['START'],
  'up': Joypad['UP'],
  'down': Joypad['DOWN'],
  'left': Joypad['LEFT'],
  'right': Joypad['RIGHT'],
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
