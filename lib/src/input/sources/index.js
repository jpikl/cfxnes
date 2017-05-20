import Keyboard, {KEYBOARD} from './Keyboard';
import Mouse, {MOUSE, MOUSE_CURSOR} from './Mouse';
import Gamepad, {GAMEPAD} from './Gamepad';

export default {
  [KEYBOARD]: {Source: Keyboard, indexed: false},
  [MOUSE]: {Source: Mouse, indexed: false},
  [GAMEPAD]: {Source: Gamepad, indexed: true},
};

export {KEYBOARD, MOUSE, MOUSE_CURSOR, GAMEPAD};
