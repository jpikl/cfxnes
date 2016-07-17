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

  updateInput(name, value) {
    if (name in buttons) {
      this.joypad.setButtonPressed(buttons[name], value);
    }
  }

}
