var logger;

logger = require("../utils/logger").get();

function MapperFactory(injector) {
  this.injector = injector;
  this.mappers = [];
  this.registerMapper(0x00, "NROM", require("../mappers/nrom-mapper"));
  this.registerMapper(0x01, "MMC1", require("../mappers/mmc1-mapper"));
  this.registerMapper(0x02, "UNROM", require("../mappers/unrom-mapper"));
  this.registerMapper(0x03, "CNROM", require("../mappers/cnrom-mapper"));
  this.registerMapper(0x04, "MMC3", require("../mappers/mmc3-mapper"));
  this.registerMapper(0x07, "AOROM", require("../mappers/aorom-mapper"));
}

MapperFactory.prototype.registerMapper = function(id, name, clazz) {
  return this.mappers[id] = {
    name: name,
    clazz: clazz
  };
};

MapperFactory.prototype.createMapper = function(cartridge) {
  var id, mapper;
  id = cartridge.mapperId;
  mapper = this.mappers[id];
  if (mapper == null) {
    throw new Error("Unsupported mapper (ID: " + id + ").");
  }
  logger.info("Using '" + mapper.name + "' mapper");
  return this.injector.inject(new mapper.clazz(cartridge));
};


module.exports = MapperFactory;
