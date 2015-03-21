var logger;

logger = require("../utils/logger").get();
var INESLoader = require("../loaders/ines-loader");
var NES2Loader = require("../loaders/nes2-loader");

function LoaderFactory() {
  this.loaders = [
    new INESLoader,
    new NES2Loader
  ];
}

LoaderFactory.prototype.createLoader = function(reader) {
  var i, len, loader, ref;
  ref = this.loaders;
  for (i = 0, len = ref.length; i < len; i++) {
    loader = ref[i];
    if (loader.supports(reader)) {
      logger.info("Using '" + loader.name + "' loader");
      return loader;
    }
  }
  throw new Error("Unsupported data format.");
};


module.exports = LoaderFactory;
