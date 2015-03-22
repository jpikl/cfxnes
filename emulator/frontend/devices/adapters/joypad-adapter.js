import { Joypad, Button } from "../../../core/devices/joypad";

var buttonAliases = {
  "a": Button.A,
  "b": Button.B,
  "select": Button.SELECT,
  "start": Button.START,
  "up": Button.UP,
  "down": Button.DOWN,
  "left": Button.LEFT,
  "right": Button.RIGHT
};

export function JoypadAdapter(joypad) {
  this.joypad = joypad;
}

JoypadAdapter.prototype.getDevice = function() {
  return this.joypad;
};

JoypadAdapter.prototype.inputChanged = function(input, down) {
  var button;
  button = buttonAliases[input];
  if (button != null) {
    return this.joypad.setButtonPressed(button, down);
  }
};
