var logger;

logger = require("../utils/logger").get();

function DeviceFactory(injector) {
  this.injector = injector;
  this.devices = {
    "joypad": require("../devices/joypad"),
    "zapper": require("../devices/zapper")
  };
}

DeviceFactory.prototype.createDevice = function(id) {
  logger.info("Creating device '" + id + "'");
  return this.injector.injectInstance(new this.devices[id]);
};


module.exports = DeviceFactory;
