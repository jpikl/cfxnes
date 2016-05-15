const axisNames = [
  'left-stick-x', 'left-stick-y',
  'right-stick-x', 'right-stick-y',
];

const buttonNames = [
  'a', 'b', 'x', 'y',
  'left-bumper', 'right-bumper',
  'left-trigger', 'right-trigger',
  'back', 'start',
  'left-stick', 'rigt-stick',
  'dpad-up', 'dpad-down', 'dpad-left', 'dpad-right',
  'guide',
];

//=========================================================
// Gamepad event handler
//=========================================================

export default class Gamepad {

  constructor() {
    this.dependencies = ['inputModule'];
    this.gamepads = {};
  }

  inject(inputModule) {
    this.inputModule = inputModule;
    this.scheduleNextUpdate();
  }

  //=========================================================
  // Periodical polling of gamepad state
  //=========================================================

  scheduleNextUpdate() {
    if (navigator.getGamepads) {
      requestAnimationFrame(() => this.updateGamepads());
    }
  }

  updateGamepads() {
    var gamepads = this.readGamepads();
    if (this.gamepads != null) {
      this.detectChanges(this.gamepads, gamepads);
    }
    this.gamepads = gamepads;
    this.scheduleNextUpdate();
  }

  readGamepads() {
    var state = {};
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; i++) {
      var gamepad = gamepads[i];
      state[i] = gamepad && {
        index: gamepad.index,
        mapping: gamepad.mapping,
        axes: gamepad.axes.map(axis => axis > 0.5 ? 1 : (axis < -0.5 ? -1 : 0)),
        buttons: gamepad.buttons.map(button => button.pressed),
      };
    }
    return state;
  }

  //=========================================================
  // Detection of gamepad changes
  //=========================================================

  detectChanges(oldGamepads, newGamepads) {
    for (var gamepadIndex in oldGamepads) {
      var oldGamepad = oldGamepads[gamepadIndex];
      var newGamepad = newGamepads[gamepadIndex];
      if (oldGamepad && newGamepad) {
        var oldAxes = oldGamepad.axes;
        var newAxes = newGamepad.axes;
        for (var i = 0; i < Math.min(oldAxes.length, newAxes.length); i++) {
          if (oldAxes[i] !== newAxes[i]) {
            this.onAxisChange(oldGamepad, i, oldAxes[i], newAxes[i]);
          }
        }
        var oldButtons = oldGamepad.buttons;
        var newButtons = newGamepad.buttons;
        for (var i = 0; i < Math.min(oldButtons.length, newButtons.length); i++) {
          if (oldButtons[i] !== newButtons[i]) {
            this.onButtonChange(oldGamepad, i, newButtons[i]);
          }
        }
      }
    }
  }

  //=========================================================
  // Event callbacks
  //=========================================================

  onAxisChange(gamepad, axisIndex, oldValue, newValue) {
    if (oldValue) {
      var name = this.createAxisName(gamepad, axisIndex, oldValue);
      this.processInput(gamepad, name, false);
    }
    if (newValue) {
      var name = this.createAxisName(gamepad, axisIndex, newValue);
      this.processInput(gamepad, name, true);
    }
  }

  onButtonChange(gamepad, buttonIndex, newValue) {
    var name = this.createButtonName(gamepad, buttonIndex);
    this.processInput(gamepad, name, newValue);
  }

  //=========================================================
  // Input processing
  //=========================================================

  createAxisName(gamepad, axisIndex, value) {
    var direction = value > 0 ? '+' : '-';
    if (gamepad.mapping === 'standard') {
      return axisNames[axisIndex] + direction; // Standard name
    }
    return 'axis-' + axisIndex + direction; // Generic name
  }

  createButtonName(gamepad, buttonIndex) {
    if (gamepad.mapping === 'standard') {
      return buttonNames[buttonIndex]; // Standard name
    }
    return 'button-' + buttonIndex; // Generic name
  }

  processInput(gamepad, name, down) {
    var input = {source: 'gamepad' + gamepad.index, name: name};
    this.inputModule.processInput(input, down);
  }

}
