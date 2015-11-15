// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import Joypad from '../devices/Joypad';
import Zapper from '../devices/Zapper';
import logger from '../utils/logger';

var devices = {
  'joypad': Joypad,
  'zapper': Zapper,
};

//=========================================================
// Factory for device creation
//=========================================================

export default class DeviceFactory {

  constructor(injector) {
    this.injector = injector;
  }

  createDevice(id) {
    var clazz = devices[id];
    if (clazz) {
      logger.info(`Creating "${id}" device`);
      return this.injector.inject(new clazz);
    }
    throw new Error(`Unsupported device "${id}"`);
  }

}
