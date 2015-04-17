import { arrayToProperties } from "../../core/utils/arrays";
import { logger }            from "../../core/utils/logger";
import { forEeachProperty }  from "../../core/utils/objects";

export function InputManager() {}

export const ports = [1, 2];

InputManager["dependencies"] = [ "nes", "deviceFactory" ];

InputManager.prototype.init = function(nes, deviceFactory) {
  logger.info("Initializing input manager");
  this.nes = nes;
  this.deviceFactory = deviceFactory;
  this.initSources();
  this.initTargets();
  return this.setDefaults();
};

InputManager.prototype.setDefaults = function() {
  logger.info("Using default input configuration");
  this.clearMapping();
  this.connectTarget(1, "joypad");
  this.connectTarget(2, "zapper");
  this.mapInput(1, "joypad", "a", "keyboard", "c");
  this.mapInput(1, "joypad", "b", "keyboard", "x");
  this.mapInput(1, "joypad", "start", "keyboard", "enter");
  this.mapInput(1, "joypad", "select", "keyboard", "shift");
  this.mapInput(1, "joypad", "up", "keyboard", "up");
  this.mapInput(1, "joypad", "down", "keyboard", "down");
  this.mapInput(1, "joypad", "left", "keyboard", "left");
  this.mapInput(1, "joypad", "right", "keyboard", "right");
  return this.mapInput(2, "zapper", "trigger", "mouse", "left");
};

InputManager.prototype.initSources = function() {
  var i, id, len, ref, results;
  this.sources = {};
  ref = ["keyboard", "mouse"];
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    id = ref[i];
    results.push(this.registerSource(id));
  }
  return results;
};

InputManager.prototype.registerSource = function(id) {
  logger.info("Registering source input device '" + id + "'");
  return this.sources[id] = this.deviceFactory.createSourceDevice(id);
};

InputManager.prototype.processSources = function() {
  var id, ids, port, ref, ref1, results, source, state, target;
  state = {};
  ref = this.sources;
  for (id in ref) {
    source = ref[id];
    if (typeof source.readState === "function") {
      source.readState(state);
    }
  }
  ref1 = this.targets;
  results = [];
  for (port in ref1) {
    ids = ref1[port];
    results.push((function() {
      var results1;
      results1 = [];
      for (id in ids) {
        target = ids[id];
        results1.push(typeof target.stateChanged === "function" ? target.stateChanged(state) : void 0);
      }
      return results1;
    })());
  }
  return results;
};

InputManager.prototype.initTargets = function() {
  var i, id, len, ref, results;
  this.targets = {};
  ref = ["joypad", "zapper"];
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    id = ref[i];
    results.push(this.registerTarget(id));
  }
  return results;
};

InputManager.prototype.registerTarget = function(id) {
  var base, i, len, port, ref, results;
  logger.info("Registering target input device '" + id + "'");
  ref = ports;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    port = ref[i];
    if ((base = this.targets)[port] == null) {
      base[port] = {};
    }
    results.push(this.targets[port][id] = this.deviceFactory.createTargetDevice(id));
  }
  return results;
};

InputManager.prototype.connectTarget = function(port, id) {
  var device, ref, ref1;
  logger.info("Setting target input device on port " + port + " to '" + id + "'");
  device = (ref = this.targets[port]) != null ? (ref1 = ref[id]) != null ? ref1.getDevice() : void 0 : void 0;
  return this.nes.connectInputDevice(port, device);
};

InputManager.prototype.getConnectedTarget = function(port) {
  var id, ref, target;
  ref = this.targets[port];
  for (id in ref) {
    target = ref[id];
    if (this.nes.getConnectedInputDevice(port) === target.getDevice()) {
      return id;
    }
  }
  return null;
};

InputManager.prototype.processInput = function(sourceId, sourceInput, inputDown) {
  if (this.isRecording()) {
    if (!inputDown) {
      return this.finishRecording(sourceId, sourceInput);
    }
  } else {
    return this.forwardInput(sourceId, sourceInput, inputDown);
  }
};

InputManager.prototype.forwardInput = function(sourceId, sourceInput, inputDown) {
  var ref, ref1, target, targetParams;
  targetParams = (ref = this.targetsMapping[sourceId]) != null ? ref[sourceInput] : void 0;
  if (targetParams) {
    target = (ref1 = this.targets[targetParams[0]]) != null ? ref1[targetParams[1]] : void 0;
    if (target != null) {
      target.inputChanged(targetParams[2], inputDown);
    }
    return true;
  } else {
    return false;
  }
};

InputManager.prototype.recordInput = function(callback) {
  logger.info("Recording input");
  return this.recordCallback = callback;
};

InputManager.prototype.isRecording = function() {
  return this.recordCallback != null;
};

InputManager.prototype.finishRecording = function(sourceId, sourceInput) {
  logger.info("Caught input '" + sourceInput + "' from '" + sourceId + "'");
  this.recordCallback(sourceId, sourceInput);
  this.recordCallback = null;
  return true;
};

InputManager.prototype.clearMapping = function() {
  this.sourcesMapping = {};
  return this.targetsMapping = {};
};

InputManager.prototype.mapInput = function(targetPort, targetId, targetInput, sourceId, sourceInput) {
  var base, base1, base2;
  logger.info("Mapping '" + sourceInput + "' of '" + sourceId + "' to '" + targetInput + "' of '" + targetId + "' on port " + targetPort);
  this.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
  if ((base = this.targetsMapping)[sourceId] == null) {
    base[sourceId] = {};
  }
  this.targetsMapping[sourceId][sourceInput] = [targetPort, targetId, targetInput];
  if ((base1 = this.sourcesMapping)[targetPort] == null) {
    base1[targetPort] = {};
  }
  if ((base2 = this.sourcesMapping[targetPort])[targetId] == null) {
    base2[targetId] = {};
  }
  return this.sourcesMapping[targetPort][targetId][targetInput] = [sourceId, sourceInput];
};

InputManager.prototype.unmapInput = function(targetPort, targetId, targetInput, sourceId, sourceInput) {
  var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, sourceParams, targetParams;
  sourceParams = (ref = this.sourcesMapping[targetPort]) != null ? (ref1 = ref[targetId]) != null ? ref1[targetInput] : void 0 : void 0;
  targetParams = (ref2 = this.targetsMapping[sourceId]) != null ? ref2[sourceInput] : void 0;
  if ((ref3 = this.sourcesMapping[targetPort]) != null) {
    if ((ref4 = ref3[targetId]) != null) {
      ref4[targetInput] = null;
    }
  }
  if (targetParams) {
    if ((ref5 = this.sourcesMapping[targetParams[0]]) != null) {
      if ((ref6 = ref5[targetParams[1]]) != null) {
        ref6[targetParams[2]] = null;
      }
    }
  }
  if ((ref7 = this.targetsMapping[sourceId]) != null) {
    ref7[sourceInput] = null;
  }
  if (sourceParams) {
    return (ref8 = this.targetsMapping[sourceParams[0]]) != null ? ref8[sourceParams[1]] = null : void 0;
  }
};

InputManager.prototype.getMappedInputName = function(targetPort, targetId, targetInput) {
  var ref, ref1, source, sourceParams;
  sourceParams = (ref = this.sourcesMapping[targetPort]) != null ? (ref1 = ref[targetId]) != null ? ref1[targetInput] : void 0 : void 0;
  if (sourceParams) {
    source = this.sources[sourceParams[0]];
    return source != null ? source.getInputName(sourceParams[1]) : void 0;
  }
};

InputManager.prototype.readConfiguration = function() {
    logger.info("Reading input manager configuration");
    return {
        "mapping": this.targetsMapping,
        "devices": arrayToProperties(ports, this.getConnectedTarget, this)
    };
};

InputManager.prototype.writeConfiguration = function(config) {
    if (config) {
        logger.info("Writing input manager configuration");
        if (config["devices"]) {
            forEeachProperty(config["devices"], this.connectTarget, this);
        }
        if(config["mapping"]) {
            this.clearMapping();
            forEeachProperty(config["mapping"], (sourceId, sourceInputs) => {
                forEeachProperty(sourceInputs, (sourceInput, targetParams) => {
                    if (targetParams) {
                        this.mapInput(targetParams[0], targetParams[1], targetParams[2], sourceId, sourceInput);
                    }
                }, this);
            }, this);
        }
    }
};
