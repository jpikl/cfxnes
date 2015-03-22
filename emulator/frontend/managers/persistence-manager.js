import { logger } from "../../core/utils/logger";

var
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

const DEFAULT_SAVE_PERIOD = 60000;

export function PersistenceManager() {
  this.saveAll = bind(this.saveAll, this);
}

PersistenceManager["dependencies"] = ["nes", "storage", "videoManager", "audioManager", "inputManager", "executionManager"];

PersistenceManager.prototype.init = function(nes, storage, videoManager, audioManager, inputManager, executionManager) {
  this.nes = nes;
  this.storage = storage;
  this.videoManager = videoManager;
  this.audioManager = audioManager;
  this.inputManager = inputManager;
  this.executionManager = executionManager;
  this.initListeners();
  return this.setDefaults();
};

PersistenceManager.prototype.initListeners = function() {
  return window.addEventListener("beforeunload", this.saveAll);
};

PersistenceManager.prototype.setDefaults = function() {
  logger.info("Using default persistence configuration");
  return this.enablePeriodicSave(DEFAULT_SAVE_PERIOD);
};

PersistenceManager.prototype.enablePeriodicSave = function(period) {
  if (period == null) {
    period = DEFAULT_SAVE_PERIOD;
  }
  this.disablePeriodicSave();
  logger.info("Enabling periodic save with period " + period + " ms");
  return this.periodicSaveId = setInterval(this.saveAll, period);
};

PersistenceManager.prototype.disablePeriodicSave = function() {
  if (this.isPeriodicSave()) {
    logger.info("Disabling periodic save");
    return clearInterval(this.periodicSaveId);
  }
};

PersistenceManager.prototype.isPeriodicSave = function() {
  return this.periodicSaveId != null;
};

PersistenceManager.prototype.saveAll = function() {
  this.saveCartridgeData();
  this.saveConfiguration();
  return void 0;
};

PersistenceManager.prototype.loadCartridgeData = function() {
  if (this.nes.isCartridgeInserted()) {
    logger.info("Loading cartridge data");
    return this.nes.loadCartridgeData(this.storage);
  }
};

PersistenceManager.prototype.saveCartridgeData = function() {
  if (this.nes.isCartridgeInserted()) {
    logger.info("Saving cartridge data");
    return this.nes.saveCartridgeData(this.storage);
  }
};

PersistenceManager.prototype.loadConfiguration = function() {
  var config;
  config = this.storage.readObject("config");
  if (config) {
    logger.info("Loading configuration");
    this.videoManager.readConfiguration(config);
    this.audioManager.readConfiguration(config);
    this.inputManager.readConfiguration(config);
    return this.executionManager.readConfiguration(config);
  }
};

PersistenceManager.prototype.saveConfiguration = function() {
  var config;
  logger.info("Saving configuration");
  config = {};
  this.videoManager.writeConfiguration(config);
  this.audioManager.writeConfiguration(config);
  this.inputManager.writeConfiguration(config);
  this.executionManager.writeConfiguration(config);
  return this.storage.writeObject("config", config);
};
