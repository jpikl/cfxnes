import {toString} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import {ports, devices, isPort, isDevice} from './common';

function createAdapters() {
  const adapters = {};
  for (const port of ports) {
    adapters[port] = {};
    for (const name in devices) {
      const {Device, Adapter} = devices[name];
      adapters[port][name] = new Adapter(new Device);
    }
  }
  return adapters;
}

export default class Devices {

  constructor(nes) {
    log.info('Initializing devices');

    this.nes = nes;
    this.adapters = createAdapters();

    this.set(1, 'joypad');
    this.set(2, 'zapper');
  }

  set(port, name) {
    if (!isPort(port)) {
      throw new Error('Invalid port: ' + toString(port));
    }
    if (name !== null && !isDevice(name)) {
      throw new Error('Invalid device: ' + toString(name));
    }
    if (this.get(port) !== name) {
      log.info(`Setting device on port ${port} to "${name || 'none'}"`);
      const device = name != null ? this.adapters[port][name].getDevice() : null;
      this.nes.setInputDevice(port, device);
    }
  }

  get(port) {
    if (!isPort(port)) {
      throw new Error('Invalid port: ' + toString(port));
    }
    const device = this.nes.getInputDevice(port);
    for (const name in devices) {
      if (device instanceof devices[name].Device) {
        return name;
      }
    }
    return null;
  }

  updateInput(port, deviceName, inputName, value) {
    const adapter = this.adapters[port][deviceName];
    return adapter.updateInput(inputName, value);
  }

}
