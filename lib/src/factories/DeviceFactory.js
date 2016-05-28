import Gamepad from '../devices/sources/Gamepad';
import Keyboard from '../devices/sources/Keyboard';
import Mouse from '../devices/sources/Mouse';
import JoypadAdapter from '../devices/adapters/JoypadAdapter';
import ZapperAdapter from '../devices/adapters/ZapperAdapter';
import CoreDeviceFactory from '../../../core/src/factories/DeviceFactory';
import logger from '../../../core/src/utils/logger';

const sources = {
  'gamepad': Gamepad,
  'keyboard': Keyboard,
  'mouse': Mouse,
};

const adapters = {
  'joypad': JoypadAdapter,
  'zapper': ZapperAdapter,
};

//=========================================================
// Factory for device creation
//=========================================================

export default class DeviceFactory extends CoreDeviceFactory {

  createSource(type) {
    const clazz = sources[type];
    if (clazz) {
      logger.info(`Creating "${type}" device`);
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

}
