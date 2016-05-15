// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import logger from '../../../core/src/utils/logger';

const ports = [1, 2];
const sourceTypes = ['keyboard', 'mouse', 'gamepad'];
const deviceTypes = ['joypad', 'zapper'];

//=========================================================
// Input module
//=========================================================

export default class InputModule {

  constructor() {
    this.dependencies = ['nes', 'deviceFactory'];
  }

  inject(nes, deviceFactory) {
    logger.info('Initializing input module');
    this.nes = nes;
    this.deviceFactory = deviceFactory;
    this.initSources();
    this.initDevices();
    this.initOptions();
  }

  initOptions() {
    var defaultDevices = ['joypad', 'zapper'];
    var defaultMapping = {
      '1.joypad.a': 'keyboard.x',
      '1.joypad.b': ['keyboard.y', 'keyboard.z'],
      '1.joypad.start': 'keyboard.enter',
      '1.joypad.select': 'keyboard.shift',
      '1.joypad.up': 'keyboard.up',
      '1.joypad.down': 'keyboard.down',
      '1.joypad.left': 'keyboard.left',
      '1.joypad.right': 'keyboard.right',
      '2.zapper.trigger': 'mouse.left',
    };
    this.options = [
      {name: 'inputDevices', get: this.getDevices, set: this.setDevices, def: defaultDevices},
      {name: 'inputMapping', get: this.getMapping, set: this.setMapping, def: defaultMapping},
    ];
  }

  //=========================================================
  // Sources
  //=========================================================

  initSources() {
    this.sources = {};
    for (var type of sourceTypes) {
      logger.info(`Registering "${type}" source`);
      this.sources[type] = this.deviceFactory.createSource(type);
    }
  }

  //=========================================================
  // Devices
  //=========================================================

  initDevices() {
    this.adapters = {};
    for (var port of ports) {
      this.adapters[port] = {};
      for (var type of deviceTypes) {
        logger.info(`Registering "${type}" device on port ${port}`);
        this.adapters[port][type] = this.deviceFactory.createAdapter(type);
      }
    }
  }

  setDevice(port, type) {
    if (this.getDevice(port) !== type) {
      logger.info(`Setting device on port ${port} to "${type || 'none'}"`);
      var adapter = this.adapters[port][type];
      var device = adapter != null ? adapter.getDevice() : null;
      this.nes.setInputDevice(port, device);
    }
  }

  getDevice(port) {
    var adaptersOnPort = this.adapters[port];
    for (var type in adaptersOnPort) {
      var adapter = adaptersOnPort[type];
      if (this.nes.getInputDevice(port) === adapter.getDevice()) {
        return type;
      }
    }
    return null;
  }

  setDevices(types) {
    for (var port of ports) {
      this.setDevice(port, types[port - 1]);
    }
  }

  getDevices() {
    return ports.map(this.getDevice, this);
  }

  //=========================================================
  // State
  //=========================================================

  updateState() {
    var state = {};
    for (var type in this.sources) {
      var source = this.sources[type];
      if (source.readState) {
        source.readState(state);
      }
    }
    for (var port in this.adapters) {
      var adaptersOnPort = this.adapters[port];
      for (var type in adaptersOnPort) {
        var adapter = adaptersOnPort[type];
        if (adapter.stateChanged) {
          adapter.stateChanged(state);
        }
      }
    }
  }

  //=========================================================
  // Input processing
  //=========================================================

  processInput(sourceInput, down) {
    if (this.isRecording()) {
      if (!down) {
        this.finishRecording(sourceInput);
      }
      return true;
    }
    return this.forwardInput(sourceInput, down);
  }

  forwardInput(sourceInput, down) {
    var inputProcessed = false;
    for (var mappingItem of this.mapping) {
      if (hasSourceInput(mappingItem, sourceInput)) {
        var {device, port, name} = mappingItem.deviceInput;
        this.adapters[port][device].inputChanged(name, down);
        inputProcessed = true;
      }
    }
    return inputProcessed;
  }

  //=========================================================
  // Input recording
  //=========================================================

  recordInput(callback) {
    logger.info('Recording input');
    this.recordCallback = callback;
  }

  isRecording() {
    return this.recordCallback != null;
  }

  finishRecording(sourceInput) {
    logger.info(`Caught input "${sourceInput.name}" from "${sourceInput.source}"`);
    this.recordCallback(makeSourceDescriptor(sourceInput));
    this.recordCallback = null;
  }

  //=========================================================
  // Input mapping
  //=========================================================

  setMapping(mapping) {
    this.unmapInputs();
    for (var deviceDesciptor in mapping) {
      var sourceDescriptors = mapping[deviceDesciptor];
      this.mapInputs(deviceDesciptor, sourceDescriptors);
    }
  }

  getMapping() {
    var mapping = {};
    for (var mappingItem of this.mapping) {
      var sourceDescriptor = makeSourceDescriptor(mappingItem.sourceInput);
      var deviceDescriptor = makeDeviceDescriptor(mappingItem.deviceInput);
      if (mapping[deviceDescriptor] == null) {
        mapping[deviceDescriptor] = [];
      }
      mapping[deviceDescriptor].push(sourceDescriptor);
    }
    return mapping;
  }

  mapInputs(deviceDescriptor, sourceDescriptors) {
    if (typeof sourceDescriptors === 'string') {
      sourceDescriptors = [sourceDescriptors];
    }
    var deviceInput = parseDeviceDescriptor(deviceDescriptor);
    for (var sourceDescriptor of sourceDescriptors) {
      var sourceInput = parseSourceDescriptor(sourceDescriptor);
      for (var mappingItem of this.mapping) {
        if (hasSourceInput(mappingItem, sourceInput) && hasDeviceInput(mappingItem, deviceInput)) {
          return;
        }
      }
      logger.info(`Mapping "${deviceInput.name}" of "${deviceInput.device}" on port "${deviceInput.port}" to "${sourceInput.name}" of "${sourceInput.source}"`);
      this.mapping.push({sourceInput, deviceInput});
    }
  }

  unmapInputs(...descriptors) {
    if (!descriptors.length) {
      logger.info('Unmapping all inputs');
      this.mapping = [];
      return;
    }
    for (var descriptor of descriptors) {
      var deviceInput = parseDeviceDescriptor(descriptor);
      if (deviceInput.port) {
        logger.info(`Unmapping "${deviceInput.name}" of "${deviceInput.device}" on port "${deviceInput.port}"`);
        this.mapping = this.mapping.filter(mappingItem => !hasDeviceInput(mappingItem, deviceInput));
      } else {
        var sourceInput = parseSourceDescriptor(descriptor);
        logger.info(`Unmapping "${sourceInput.name}" of "${sourceInput.source}"`);
        this.mapping = this.mapping.filter(mappingItem => !hasSourceInput(mappingItem, sourceInput));
      }
    }
  }

  getMappedInputs(descriptor) {
    var result = [];
    var deviceInput = parseDeviceDescriptor(descriptor);
    if (deviceInput.port) {
      for (var mappingItem of this.mapping) {
        if (hasDeviceInput(mappingItem, deviceInput)) {
          result.push(makeSourceDescriptor(mappingItem.sourceInput));
        }
      }
    } else {
      var sourceInput = parseSourceDescriptor(descriptor);
      for (var mappingItem of this.mapping) {
        if (hasSourceInput(mappingItem, sourceInput)) {
          result.push(makeDeviceDescriptor(mappingItem.deviceInput));
        }
      }
    }
    return result;
  }

}

//=========================================================
// Input descriptors
//=========================================================

function makeSourceDescriptor(input) {
  return `${input.source}.${input.name}`;
}

function makeDeviceDescriptor(input) {
  return `${input.port}.${input.device}.${input.name}`;
}

function parseSourceDescriptor(descriptor) {
  var [source, name] = descriptor.split('.');
  return {source, name};
}

function parseDeviceDescriptor(descriptor) {
  var [port, device, name] = descriptor.split('.');
  port = parseInt(port);
  return {port, device, name};
}

function hasSourceInput(mappingItem, sourceInput) {
  var source1 = mappingItem.sourceInput.source;
  var source2 = sourceInput.source;
  var name1 = mappingItem.sourceInput.name;
  var name2 = sourceInput.name;
  return isSameSource(source1, source2) && name1 === name2;
}

function isSameSource(source1, source2) {
  return source1 === 'gamepad' && source2.startsWith(source1) || source1 === source2;
}

function hasDeviceInput(mappingItem, deviceInput) {
  var port1 = mappingItem.deviceInput.port;
  var port2 = deviceInput.port;
  var device1 = mappingItem.deviceInput.device;
  var device2 = deviceInput.device;
  var name1 = mappingItem.deviceInput.name;
  var name2 = deviceInput.name;
  return port1 === port2 && device1 === device2 && name1 === name2;
}
