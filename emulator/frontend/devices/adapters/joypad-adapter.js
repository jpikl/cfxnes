var Joypad, joypadButtonAliases;

Joypad = require("../../../core/devices/joypad");

joypadButtonAliases = {
  "a": Joypad["Button"].A,
  "b": Joypad["Button"].B,
  "select": Joypad["Button"].SELECT,
  "start": Joypad["Button"].START,
  "up": Joypad["Button"].UP,
  "down": Joypad["Button"].DOWN,
  "left": Joypad["Button"].LEFT,
  "right": Joypad["Button"].RIGHT
};

function JoypadAdapter(joypad) {
  this.joypad = joypad;
}

JoypadAdapter.prototype.getDevice = function() {
  return this.joypad;
};

JoypadAdapter.prototype.inputChanged = function(input, down) {
  var button;
  button = joypadButtonAliases[input];
  if (button != null) {
    return this.joypad.setButtonPressed(button, down);
  }
};

module.exports = JoypadAdapter;
