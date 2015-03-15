var logger;

logger = require("../../core/utils/logger").get();

function CartridgeManager() {}

CartridgeManager.dependencies = ["nes", "cartridgeFactory", "executionManager", "persistenceManager"];

CartridgeManager.prototype.init = function(nes, cartridgeFactory, executionManager, persistenceManager) {
  this.nes = nes;
  this.cartridgeFactory = cartridgeFactory;
  this.executionManager = executionManager;
  return this.persistenceManager = persistenceManager;
};

CartridgeManager.prototype.loadCartridge = function(file, onLoad, onError) {
  var reader, self;
  logger.info("Loding cartridge from file");
  self = this;
  reader = new FileReader;
  reader.onload = function(event) {
    var data, error;
    data = event.target.result;
    error = self.tryInsertCartridge(data);
    if (error) {
      return onError != null ? onError.call(self, error) : void 0;
    } else {
      return onLoad != null ? onLoad.call(self) : void 0;
    }
  };
  reader.onerror = function(event) {
    return onError != null ? onError.call(self, event.target.error) : void 0;
  };
  return reader.readAsArrayBuffer(file);
};

CartridgeManager.prototype.downloadCartridge = function(url, onLoad, onError) {
  var request, self;
  logger.info("Downloading cartridge from '" + url + "'");
  self = this;
  request = new XMLHttpRequest;
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    var error;
    if (this.status === 200) {
      error = self.tryInsertCartridge(this.response);
    } else {
      error = "Unable to download file '" + url + "' (status code: " + this.status + ").";
    }
    if (error) {
      return onError != null ? onError.call(self, error) : void 0;
    } else {
      return onLoad != null ? onLoad.call(self) : void 0;
    }
  };
  request.onerror = function(error) {
    return onError != null ? onError.call(self, error) : void 0;
  };
  return request.send();
};

CartridgeManager.prototype.tryInsertCartridge = function(arrayBuffer) {
  var error;
  try {
    this.insertCartridge(arrayBuffer);
    return void 0;
  } catch (_error) {
    error = _error;
    logger.error(error);
    return error.message || "Internal error";
  }
};

CartridgeManager.prototype.insertCartridge = function(arrayBuffer) {
  var cartridge;
  logger.info("Inserting cartridge");
  cartridge = this.cartridgeFactory.fromArrayBuffer(arrayBuffer);
  this.persistenceManager.saveCartridgeData();
  this.nes.insertCartridge(cartridge);
  this.nes.pressPower();
  this.persistenceManager.loadCartridgeData();
  if (this.executionManager.isRunning()) {
    return this.executionManager.restart();
  }
};

CartridgeManager.prototype.isCartridgeInserted = function() {
  return this.nes.isCartridgeInserted();
};

CartridgeManager.prototype.removeCartridge = function() {
  return this.nes.removeCartridge();
};

module.exports = CartridgeManager;
