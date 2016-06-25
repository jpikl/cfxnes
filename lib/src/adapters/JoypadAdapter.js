import Joypad from '../../../core/src/devices/Joypad';

const buttonIds = {
  'a': Joypad['A'],
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

  inputChanged(name, down) {
    const button = buttonIds[name];
    if (button != null) {
      this.joypad.setButtonPressed(button, down);
    }
  }

}
