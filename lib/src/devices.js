import {Joypad, Zapper} from '../../core/src/devices';
import log from '../../core/src/log';
import Gamepad from './sources/Gamepad';
import Keyboard from './sources/Keyboard';
import Mouse from './sources/Mouse';
import JoypadAdapter from './adapters/JoypadAdapter';
import ZapperAdapter from './adapters/ZapperAdapter';

const sources = {
  'gamepad': Gamepad,
  'keyboard': Keyboard,
  'mouse': Mouse,
};

const devices = {
  'joypad': Joypad,
  'zapper': Zapper,
};

const adapters = {
  'joypad': JoypadAdapter,
  'zapper': ZapperAdapter,
};

export function createSource(type, inputModule, videoModule) {
  const clazz = sources[type];
  if (clazz) {
    log.info(`Creating "${type}" source`);
    return new clazz(inputModule, videoModule);
  }
  throw new Error(`Unsupported source "${type}"`);
}

export function createAdapter(type, videoModule) {
  const device = createDevice(type);
  const clazz = adapters[type];
  if (clazz) {
    log.info(`Creating adapter for "${type}" device`);
    return new clazz(device, videoModule);
  }
  throw new Error(`Unsupported device adapter "${type}"`);
}

function createDevice(type) {
  const clazz = devices[type];
  if (clazz) {
    log.info(`Creating "${type}" device`);
    return new clazz;
  }
  throw new Error(`Unsupported device "${type}"`);
}
