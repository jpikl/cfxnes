import log from '../../../core/src/common/log';
import Options from '../data/Options';
import {devices, ports} from './common';

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
        const {DeviceClass, AdapterClass} = devices[name];
        this.adapters[port][name] = new AdapterClass(new DeviceClass);
      }
    }
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('inputDevices', this.setAll, this.getAll, ['joypad', 'zapper']);
    this.options.reset();
  }

  setAll(names) {
    for (let i = 0; i < ports.length; i++) {
      this.set(ports[i], names[i]);
    }
  }

  getAll() {
    return ports.map(this.get, this);
  }

  set(port, name) {
    if (this.get(port) !== name) {
      log.info(`Setting device on port ${port} to "${name || 'none'}"`);
      const device = name != null ? this.adapters[port][name].getDevice() : null;
      this.nes.setInputDevice(port, device);
    }
  }

  get(port) {
    const device = this.nes.getInputDevice(port);
    for (const name in devices) {
      if (device instanceof devices[name].DeviceClass) {
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
