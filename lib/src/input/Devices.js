import {assert} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import Options from '../data/Options';
import {ports, devices} from './common';

export default class Devices {

  constructor(nes) {
    log.info('Initializing devices');
    this.nes = nes;
    this.initAdapters();
    this.initOptions();
  }

  initAdapters() {
    this.adapters = {};
    for (const port of ports) {
      this.adapters[port] = {};
      for (const name in devices) {
        const {Device, Adapter} = devices[name];
        this.adapters[port][name] = new Adapter(new Device);
      }
    }
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('inputDevices', this.setAll, this.getAll, ['joypad', 'zapper']);
    this.options.reset();
  }

  setAll(names) {
    assert(names instanceof Array, 'Invalid input devices');
    for (let i = 0; i < ports.length; i++) {
      this.set(ports[i], names[i] || null);
    }
  }

  getAll() {
    return ports.map(this.get, this);
  }

  set(port, name) {
    assert(ports.indexOf(port) >= 0, 'Invalid input port');
    assert(name === null || name in devices, 'Invalid input device');

    if (this.get(port) !== name) {
      log.info(`Setting device on port ${port} to "${name || 'none'}"`);
      const device = name != null ? this.adapters[port][name].getDevice() : null;
      this.nes.setInputDevice(port, device);
    }
  }

  get(port) {
    assert(ports.indexOf(port) >= 0, 'Invalid input port');
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
