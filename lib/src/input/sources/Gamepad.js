import {log} from '../../../../core';
import SourceInput from '../inputs/SourceInput';

export const GAMEPAD = 'gamepad';

const axisNames = [
  'left-stick-x', 'left-stick-y',
  'right-stick-x', 'right-stick-y',
];

const buttonNames = [
  'a', 'b', 'x', 'y',
  'left-bumper', 'right-bumper',
  'left-trigger', 'right-trigger',
  'back', 'start',
  'left-stick', 'right-stick',
  'dpad-up', 'dpad-down',
  'dpad-left', 'dpad-right',
  'guide',
];

export default class Gamepad {

  constructor(router) {
    log.info('Initializing gamepads');
    this.router = router;
    this.gamepads = null;
    this.requestId = 0;
  }

  //=========================================================
  // Activation
  //=========================================================

  activate() {
    if (navigator.getGamepads) {
      log.info('Activating gamepads');
      this.requestUpdate();
    } else {
      log.warn('Cannot activate gamepads (Gamepad API is not available)');
    }
  }

  deactivate() {
    log.info('Deactivating gamepads');
    cancelAnimationFrame(this.requestId);
  }

  requestUpdate() {
    this.requestId = requestAnimationFrame(() => this.updateGamepads());
  }

  //=========================================================
  // Update
  //=========================================================

  updateGamepads() {
    const gamepads = this.readGamepads();
    if (this.gamepads) {
      this.detectChanges(this.gamepads, gamepads);
    }
    this.gamepads = gamepads;
    this.requestUpdate();
  }

  readGamepads() {
    // Chrome does not return an actual Array, but GamepadList
    // Firefox does not return immutable Gamepad objects, so we need to make their copy
    return Array.from(navigator.getGamepads()).map(gp => gp && {
      index: gp.index,
      mapping: gp.mapping,
      axes: gp.axes.map(Math.round),
      buttons: gp.buttons.map(button => button.pressed),
    });
  }

  detectChanges(oldGamepads, newGamepads) {
    for (let i = 0; i < oldGamepads.length; i++) {
      const oldGamepad = oldGamepads[i];
      const newGamepad = newGamepads[i];
      if (oldGamepad && newGamepad) {
        const oldAxes = oldGamepad.axes;
        const newAxes = newGamepad.axes;
        for (let j = 0; j < Math.min(oldAxes.length, newAxes.length); j++) {
          if (oldAxes[j] !== newAxes[j]) {
            this.onAxisChange(newGamepad, j, oldAxes[j], newAxes[j]);
          }
        }
        const oldButtons = oldGamepad.buttons;
        const newButtons = newGamepad.buttons;
        for (let j = 0; j < Math.min(oldButtons.length, newButtons.length); j++) {
          if (oldButtons[j] !== newButtons[j]) {
            this.onButtonChange(newGamepad, j, newButtons[j]);
          }
        }
      }
    }
  }

  //=========================================================
  // Events
  //=========================================================

  onAxisChange(gamepad, axisIndex, oldValue, newValue) {
    if (oldValue) {
      const axisName = getAxisName(gamepad, axisIndex, oldValue);
      this.routeInput(gamepad, axisName, false);
    }
    if (newValue) {
      const axisName = getAxisName(gamepad, axisIndex, newValue);
      this.routeInput(gamepad, axisName, true);
    }
  }

  onButtonChange(gamepad, buttonIndex, newValue) {
    const buttonName = getButtonName(gamepad, buttonIndex);
    this.routeInput(gamepad, buttonName, newValue);
  }

  routeInput(gamepad, name, value) {
    const input = new SourceInput(GAMEPAD + gamepad.index, name);
    this.router.routeInput(input, value);
  }

}

//=========================================================
// Utils
//=========================================================

function getAxisName(gamepad, axisIndex, value) {
  const direction = value > 0 ? '+' : '-';
  if (gamepad.mapping === 'standard') {
    return axisNames[axisIndex] + direction; // Standard name
  }
  return 'axis-' + axisIndex + direction; // Generic name
}

function getButtonName(gamepad, buttonIndex) {
  if (gamepad.mapping === 'standard') {
    return buttonNames[buttonIndex]; // Standard name
  }
  return 'button-' + buttonIndex; // Generic name
}
