// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import logger from '../../../core/src/utils/logger';
import {arrayToProperties} from '../../../core/src/utils/arrays';
import {forEachProperty, getProperty, setProperty} from '../../../core/src/utils/objects';

export const ports = [1, 2];
export const sourceIds = ['keyboard', 'mouse', 'gamepad'];
export const targetIds = ['joypad', 'zapper'];

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
    this.initTargets();
    this.initMapping();
    this.initOptions();
  }

  initOptions() {
    var defaultDevices = {1: 'joypad', 2: 'zapper'}; // TODO maybe use array instead???
    // TODO use different format
    // {'joypad:1:a' = 'keyboard:c', ...}
    var defaultMapping = {
      'keyboard': {
        'c':     [1, 'joypad', 'a'],
        'x':     [1, 'joypad', 'b'],
        'enter': [1, 'joypad', 'start'],
        'shift': [1, 'joypad', 'select'],
        'up':    [1, 'joypad', 'up'],
        'down':  [1, 'joypad', 'down'],
        'left':  [1, 'joypad', 'left'],
        'right': [1, 'joypad', 'right'],
      },
      'mouse': {
        'left': [2, 'zapper', 'trigger'],
      },
    };
    this.options = [
      {name: 'inputDevices', get: this.getDevices, set: this.setDevices, def: defaultDevices},
      {name: 'inputMapping', get: this.getMapping, set: this.setMapping, def: defaultMapping},
    ];
  }

  //=========================================================
  // Source input devices
  //=========================================================

  initSources() {
    this.sources = {};
    for (var id of sourceIds) {
      logger.info(`Registering source input device "${id}"`);
      this.sources[id] = this.deviceFactory.createSourceDevice(id);
    }
  }

  readSourcesState() {
    var state = {};
    for (var id in this.sources) {
      var source = this.sources[id];
      if (source.readState) {
        source.readState(state);
      }
    }
    return state;
  }

  //=========================================================
  // Target input devices
  //=========================================================

  // TODO rename sources/targets to something else (devices / virtual devices???)

  initTargets() {
    this.targets = {};
    for (var port of ports) {
      this.targets[port] = {};
      for (var id of targetIds) {
        logger.info(`Registering target input device "${id}" on port ${port}`);
        this.targets[port][id] = this.deviceFactory.createTargetDevice(id);
      }
    }
  }

  connectTarget(port, id) {
    if (this.getConnectedTarget(port) !== id) {
      logger.info(`Setting target input device on port ${port} to "${id || 'none'}"`);
      var device = id != null ? this.targets[port][id].getDevice() : null;
      this.nes.connectInputDevice(port, device);
    }
  }

  getConnectedTarget(port) {
    var targetsOnPort = this.targets[port];
    for (var id in targetsOnPort) {
      var target = targetsOnPort[id];
      if (this.nes.getConnectedInputDevice(port) === target.getDevice()) {
        return id;
      }
    }
  }

  updateTargetsState(state) {
    for (var port in this.targets) {
      var targetsOnPort = this.targets[port];
      for (var id in targetsOnPort) {
        var target = targetsOnPort[id];
        if (target.stateChanged) {
          target.stateChanged(state);
        }
      }
    }
  }

  setDevices(devices) {
    forEachProperty(devices, this.connectTarget, this);
  }

  getDevices() {
    return arrayToProperties(ports, this.getConnectedTarget, this);
  }

  //=========================================================
  // Input processing
  //=========================================================

  processInput(sourceId, sourceInput, inputDown) {
    if (this.isRecording()) {
      if (!inputDown) {
        this.finishRecording(sourceId, sourceInput);
      }
      return true;
    } else {
      return this.forwardInput(sourceId, sourceInput, inputDown);
    }
  }

  forwardInput(sourceId, sourceInput, inputDown) {
    var targetParams = getProperty(this.targetsMapping, sourceId, sourceInput);
    if (targetParams) {
      var [targetPort, targetId, targetInput] = targetParams;
      this.targets[targetPort][targetId].inputChanged(targetInput, inputDown);
      return true;
    }
    return false;
  }

  //=========================================================
  // Input state update
  //=========================================================

  updateState() {
    this.updateTargetsState(this.readSourcesState());
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

  finishRecording(sourceId, sourceInput) {
    logger.info(`Caught input "${sourceInput}" from "${sourceId}"`);
    this.recordCallback(sourceId, sourceInput);
    this.recordCallback = null;
  }

  //=========================================================
  // Input mapping
  //=========================================================

  initMapping() {
    this.sourcesMapping = {}; // Mapping between sources and targets (target -> source)
    this.targetsMapping = {}; // Mapping between sources and targets (source -> target)
  }

  setMapping(mapping) {
    forEachProperty(mapping, (sourceId, sourceInputs) => {
      forEachProperty(sourceInputs, (sourceInput, targetParams) => {
        if (targetParams) {
          var [targetPort, targetId, targetInput] = targetParams;
          this.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
        }
      });
    });
  }

  getMapping() {
    return this.targetsMapping; // TODO deep clone
  }

  mapInput(targetPort, targetId, targetInput, sourceId, sourceInput) {
    logger.info(`Mapping "${sourceInput}" of "${sourceId}" to "${targetInput}" of "${targetId}" on port ${targetPort}`);
    this.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
    setProperty(this.sourcesMapping, targetPort, targetId, targetInput, [sourceId, sourceInput]);
    setProperty(this.targetsMapping, sourceId, sourceInput, [targetPort, targetId, targetInput]);
  }

  unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput) {
    var sourceParams = getProperty(this.sourcesMapping, targetPort, targetId, targetInput);
    var targetParams = getProperty(this.targetsMapping, sourceId, sourceInput);
    setProperty(this.sourcesMapping, targetPort, targetId, targetInput, null);
    setProperty(this.targetsMapping, sourceId, sourceInput, null);
    if (targetParams) {
      setProperty(this.sourcesMapping, targetParams[0], targetParams[1], targetParams[2], null);
    }
    if (sourceParams) {
      setProperty(this.targetsMapping, sourceParams[0], sourceParams[1], null);
    }
  }

  getMappedInputName(targetPort, targetId, targetInput) {
    var sourceParams = getProperty(this.sourcesMapping, targetPort, targetId, targetInput);
    if (sourceParams) {
      var [sourceId, sourceInput] = sourceParams;
      return this.sources[sourceId].getInputName(sourceInput);
    }
  }

}
