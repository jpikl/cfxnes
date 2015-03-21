var logger, mirroringToString, readableBytes, readableSize, tvSystemToString;

tvSystemToString = require("../common/types").TVSystem.toString;

mirroringToString = require("../common/types").Mirroring.toString;

readableSize = require("../utils/format").readableSize;

readableBytes = require("../utils/format").readableBytes;

logger = require("../utils/logger").get();

function CartridgeFactory() {}

CartridgeFactory.dependencies = ["loaderFactory"];

CartridgeFactory.prototype.init = function(loaderFactory) {
  return this.loaderFactory = loaderFactory;
};

CartridgeFactory.prototype.fromArrayBuffer = function(arrayBuffer) {
  var ArrayBufferReader;
  ArrayBufferReader = require("../readers/array-buffer-reader");
  return this.fromReader(new ArrayBufferReader(arrayBuffer));
};

CartridgeFactory.prototype.fromLocalFile = function(filePath) {};

CartridgeFactory.prototype.fromReader = function(reader) {
  var cartridge, loader;
  loader = this.loaderFactory.createLoader(reader);
  cartridge = loader.load(reader);
  this.printCartridgeInfo(cartridge);
  return cartridge;
};

CartridgeFactory.prototype.printCartridgeInfo = function(cartridge) {
  var ref, ref1;
  logger.info("==========[Cartridge Info - Start]==========");
  logger.info("Mapper ID             : " + cartridge.mapperId);
  logger.info("Sub-mapper ID         : " + cartridge.subMapperId);
  logger.info("has PRG RAM           : " + cartridge.hasPRGRAM);
  logger.info("has PRG RAM battery   : " + cartridge.hasPRGRAMBattery);
  logger.info("has CHR RAM           : " + cartridge.hasCHRRAM);
  logger.info("has CHR RAM battery   : " + cartridge.hasCHRRAMBattery);
  logger.info("has BUS conflicts     : " + cartridge.hasBUSConflicts);
  logger.info("has trainer           : " + cartridge.hasTrainer);
  logger.info("PRG ROM size          : " + (readableSize((ref = cartridge.prgROMSize) != null ? ref : cartridge.prgROM.length)));
  logger.info("PRG RAM size          : " + (readableSize(cartridge.prgRAMSize)));
  logger.info("PRG RAM size (battery): " + (readableSize(cartridge.prgRAMSizeBattery)));
  logger.info("CHR ROM size          : " + (readableSize((ref1 = cartridge.chrROMSize) != null ? ref1 : cartridge.chrROM.length)));
  logger.info("CHR RAM size          : " + (readableSize(cartridge.chrRAMSize)));
  logger.info("CHR RAM size (battery): " + (readableSize(cartridge.chrRAMSizeBattery)));
  logger.info("Mirroring             : " + (mirroringToString(cartridge.mirroring)));
  logger.info("TV system             : " + (tvSystemToString(cartridge.tvSystem)));
  logger.info("is Vs Unisistem       : " + cartridge.isVsUnisistem);
  logger.info("is PlayChoice         : " + cartridge.isPlayChoice);
  logger.info("Trainer               : " + (readableBytes(cartridge.trainer)));
  return logger.info("==========[Cartridge Info - End]==========");
};

module.exports = CartridgeFactory;
