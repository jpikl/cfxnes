var logger;

logger = require("../utils/logger").get();

function LoaderFactory() {
  this.loaders = [];
  this.registerLoader("NES2", require("../loaders/nes2-loader"));
  this.registerLoader("INES", require("../loaders/ines-loader"));
}

LoaderFactory.prototype.registerLoader = function(name, clazz) {
  return this.loaders.push({
    name: name,
    clazz: clazz
  });
};

LoaderFactory.prototype.createLoader = function(reader) {
  var i, len, loader, ref;
  ref = this.loaders;
  for (i = 0, len = ref.length; i < len; i++) {
    loader = ref[i];
    reader.reset();
    if (loader.clazz.supportsInput(reader)) {
      logger.info("Using '" + loader.name + "' loader");
      return new loader.clazz(reader);
    }
  }
  throw new Error("Unsupported data format.");
};


module.exports = LoaderFactory;
