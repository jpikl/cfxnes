import {assert} from '../../../core/src/common/utils';
import Joypad from '../../../core/src/devices/Joypad';
import Zapper from '../../../core/src/devices/Zapper';
import JoypadAdapter from './adapters/JoypadAdapter';
import ZapperAdapter from './adapters/ZapperAdapter';
import Keyboard from './sources/Keyboard';
import Mouse from './sources/Mouse';
import Gamepad from './sources/Gamepad';
import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';

export const sources = {
  'keyboard': {Source: Keyboard, indexed: false},
  'mouse': {Source: Mouse, indexed: false},
  'gamepad': {Source: Gamepad, indexed: true},
};

export const devices = {
  'joypad': {Device: Joypad, Adapter: JoypadAdapter},
  'zapper': {Device: Zapper, Adapter: ZapperAdapter},
};

export const ports = [1, 2];

export function parseInput(inputStr) {
  const srcInput = SourceInput.fromString(inputStr);
  if (srcInput) {
    const {source} = srcInput;
    const sourceBase = source.replace(/[0-9]+$/, '');
    const sourceDesc = sources[sourceBase];
    assertInput(sourceDesc && sourceDesc.indexed === (source !== sourceBase), inputStr, 'invalid source');
    return srcInput;
  }
  const devInput = DeviceInput.fromString(inputStr);
  if (devInput) {
    const {port, device} = devInput;
    assertInput(ports.indexOf(port) >= 0, inputStr, 'invalid port');
    assertInput(device in devices, inputStr, 'invalid device');
    return devInput;
  }
  throw new Error(`Invalid input ${inputStr}`);
}

function assertInput(condition, inputStr, message) {
  assert(condition, `Invalid input ${inputStr}: ${message}`);
}
