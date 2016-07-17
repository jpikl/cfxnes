import log from '../../../core/src/common/log';
import Joypad from '../../../core/src/devices/Joypad';
import Zapper from '../../../core/src/devices/Zapper';
import Options from '../data/Options';
import JoypadAdapter from './adapters/JoypadAdapter';
import ZapperAdapter from './adapters/ZapperAdapter';
import {PORTS} from './common';

const deviceClasses = {
  'joypad': [Joypad, JoypadAdapter],
  'zapper': [Zapper, ZapperAdapter],
};

export default class Devices {

  constructor(nes) {
    log.info('Initializing devices');
    this.nes = nes;
    this.initAdapters();
    this.initOptions();
  }

  initAdapters() {
    this.adapters = {};
    for (const port of PORTS) {
      this.adapters[port] = {};
      for (const name in deviceClasses) {
        const [DeviceClass, AdapterClass] = deviceClasses[name];
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
    for (let i = 0; i < PORTS.length; i++) {
      this.set(PORTS[i], names[i]);
    }
  }

  getAll() {
    return PORTS.map(this.get, this);
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
    for (const name in deviceClasses) {
      if (device instanceof deviceClasses[name][0]) {
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
