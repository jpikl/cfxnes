// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import Gamepad from '../devices/Gamepad';
import Keyboard from '../devices/Keyboard';
import Mouse from '../devices/Mouse';
import Joypad from '../../core/devices/Joypad';
import Zapper from '../../core/devices/Zapper';
import JoypadAdapter from '../devices/adapters/JoypadAdapter';
import ZapperAdapter from '../devices/adapters/ZapperAdapter';
import CoreDeviceFactory from '../../core/factories/DeviceFactory';
import logger from '../../core/utils/logger';

const sourceDevices = {
  'gamepad': Gamepad,
  'keyboard': Keyboard,
  'mouse': Mouse,
};

const targetDevices = {
  'joypad': JoypadAdapter,
  'zapper': ZapperAdapter,
};

//=========================================================
// Factory for device creation
//=========================================================

export default class DeviceFactory extends CoreDeviceFactory {

  constructor(injector) {
    super(injector);
  }

  createSourceDevice(id) {
    var clazz = sourceDevices[id];
    if (!clazz) {
      throw new Error(`Unsupported source device "${id}"`);
    }
    logger.info(`Creating "${id}" device`);
    return this.injector.inject(new clazz(id));
  }

  createTargetDevice(id) {
    var device = this.createDevice(id);
    var clazz = targetDevices[id];
    if (!clazz) {
      throw new Error(`Unsupported target device "${id}" adapter`);
    }
    logger.info(`Creating adapter of "${id}" device`);
    return this.injector.inject(new clazz(device));
  }

}
