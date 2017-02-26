import {toString} from '../../../core/src/common/utils';
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

export function isDevice(device) {
  return device in devices;
}

export function isPort(port) {
  return ports.indexOf(port) >= 0;
}

export function parseInput(inputStr) {
  if (typeof inputStr !== 'string') {
    throw new Error('Invalid input: ' + toString(inputStr));
  }
  const srcInput = SourceInput.fromString(inputStr);
  if (srcInput) {
    const {source} = srcInput;
    const sourceBase = source.replace(/[0-9]+$/, '');
    const sourceDesc = sources[sourceBase];
    const indexed = source !== sourceBase;
    if (!sourceDesc || sourceDesc.indexed !== indexed) {
      throw new Error('Invalid input source: ' + toString(source));
    }
    return srcInput;
  }
  const devInput = DeviceInput.fromString(inputStr);
  if (devInput) {
    const {port, device} = devInput;
    if (!isPort(port)) {
      throw new Error('Invalid input port: ' + toString(port));
    }
    if (!isDevice(device)) {
      throw new Error('Invalid input device: ' + toString(device));
    }
    return devInput;
  }
  throw new Error('Invalid input: ' + toString(inputStr));
}
