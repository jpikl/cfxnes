import {log} from '../../../../core';
import SourceInput from '../inputs/SourceInput';

export const KEYBOARD = 'keyboard';

const keyCodeNames = {
  // Character keys (letters)
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i',
  74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r',
  83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z',
  // Character keys (numbers)
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
  // Character keys (special)
  32: 'space',
  188: ',', 190: '.', 191: '/',
  186: ';', 222: '\'', 220: '\\',
  219: '[', 221: ']',
  192: '`', 189: '-', 187: '=',
  // Function keys
  112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6',
  118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12',
  // Modifier keys
  16: 'shift', 17: 'ctrl', 18: 'alt',
  // Navigation keys
  37: 'left', 38: 'up', 39: 'right', 40: 'down',
  9: 'tab', 36: 'home', 35: 'end', 33: 'page-up', 34: 'page-down',
  // System keys
  27: 'escape', 19: 'pause',
  // Editing keys
  13: 'enter', 8: 'backspace', 45: 'insert', 46: 'delete',
  // Lock keys
  20: 'caps-lock', 144: 'num-lock', 145: 'scroll-lock',
  // Numeric keypad
  96: 'numpad-0', 97: 'numpad-1', 98: 'numpad-2', 99: 'numpad-3', 100: 'numpad-4',
  101: 'numpad-5', 102: 'numpad-6', 103: 'numpad-7', 104: 'numpad-8', 105: 'numpad-9',
  107: 'add', 109: 'subtract', 106: 'multiply', 111: 'divide', 110: 'decimal-point',
};

export default class Keyboard {

  constructor(router) {
    log.info('Initializing keyboard');
    this.router = router;
    this.keyDownCallback = event => this.onKeyChange(event, true);
    this.keyUpCallback = event => this.onKeyChange(event, false);
  }

  activate() {
    log.info('Activating keyboard');
    window.addEventListener('keydown', this.keyDownCallback);
    window.addEventListener('keyup', this.keyUpCallback);
  }

  deactivate() {
    log.info('Deactivating keyboard');
    window.removeEventListener('keydown', this.keyDownCallback);
    window.removeEventListener('keyup', this.keyUpCallback);
  }

  onKeyChange(event, down) {
    const keyCode = event.keyCode || event.which;
    const keyName = keyCodeNames[keyCode];
    const input = new SourceInput(KEYBOARD, keyName);
    if (this.router.routeInput(input, down)) {
      event.preventDefault();
    }
  }

}
