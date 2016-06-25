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

export default class Gamepad {

  constructor(inputModule) {
    this.inputModule = inputModule;
    this.gamepads = {};
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
    const gamepads = this.readGamepads();
    if (this.gamepads != null) {
      this.detectChanges(this.gamepads, gamepads);
    }
    this.gamepads = gamepads;
    this.scheduleNextUpdate();
  }

  readGamepads() {
    const state = {};
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      state[i] = gamepad && {
        index: gamepad.index,
        mapping: gamepad.mapping,
        axes: gamepad.axes.map(axis => {
          if (axis > 0.5) return 1;
          if (axis < -0.5) return -1;
          return 0;
        }),
        buttons: gamepad.buttons.map(button => button.pressed),
      };
    }
    return state;
  }

  //=========================================================
  // Detection of gamepad changes
  //=========================================================

  detectChanges(oldGamepads, newGamepads) {
    for (const gamepadIndex in oldGamepads) {
      const oldGamepad = oldGamepads[gamepadIndex];
      const newGamepad = newGamepads[gamepadIndex];
      if (oldGamepad && newGamepad) {
        const oldAxes = oldGamepad.axes;
        const newAxes = newGamepad.axes;
        for (let i = 0; i < Math.min(oldAxes.length, newAxes.length); i++) {
          if (oldAxes[i] !== newAxes[i]) {
            this.onAxisChange(oldGamepad, i, oldAxes[i], newAxes[i]);
          }
        }
        const oldButtons = oldGamepad.buttons;
        const newButtons = newGamepad.buttons;
        for (let i = 0; i < Math.min(oldButtons.length, newButtons.length); i++) {
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
      const name = this.createAxisName(gamepad, axisIndex, oldValue);
      this.processInput(gamepad, name, false);
    }
    if (newValue) {
      const name = this.createAxisName(gamepad, axisIndex, newValue);
      this.processInput(gamepad, name, true);
    }
  }

  onButtonChange(gamepad, buttonIndex, newValue) {
    const name = this.createButtonName(gamepad, buttonIndex);
    this.processInput(gamepad, name, newValue);
  }

  //=========================================================
  // Input processing
  //=========================================================

  createAxisName(gamepad, axisIndex, value) {
    const direction = value > 0 ? '+' : '-';
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
    const input = {source: 'gamepad' + gamepad.index, name: name};
    this.inputModule.processInput(input, down);
  }

}
