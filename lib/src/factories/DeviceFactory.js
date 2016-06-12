import Gamepad from '../devices/sources/Gamepad';
import Keyboard from '../devices/sources/Keyboard';
import Mouse from '../devices/sources/Mouse';
import JoypadAdapter from '../devices/adapters/JoypadAdapter';
import ZapperAdapter from '../devices/adapters/ZapperAdapter';
import {Joypad, Zapper} from '../../../core/src/devices';
import {logger} from '../../../core/src/utils';

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

//=========================================================
// Factory for device creation
//=========================================================

export default class DeviceFactory {

  constructor(injector) {
    this.injector = injector;
  }

  createSource(type) {
    const clazz = sources[type];
    if (clazz) {
      logger.info(`Creating "${type}" source`);
      return this.injector.inject(new clazz);
    }
    throw new Error(`Unsupported source "${type}"`);
  }

  createAdapter(type) {
    const device = this.createDevice(type);
    const clazz = adapters[type];
    if (clazz) {
      logger.info(`Creating adapter for "${type}" device`);
      return this.injector.inject(new clazz(device));
    }
    throw new Error(`Unsupported device adapter "${type}"`);
  }

  createDevice(type) {
    const clazz = devices[type];
    if (clazz) {
      logger.info(`Creating "${type}" device`);
      return new clazz;
    }
    throw new Error(`Unsupported device "${type}"`);
  }

}
