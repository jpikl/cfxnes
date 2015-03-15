function BaseConfig() {}

BaseConfig.prototype["nes"] = require("../nes");

BaseConfig.prototype["cpu"] = require("../units/cpu");

BaseConfig.prototype["ppu"] = require("../units/ppu");

BaseConfig.prototype["apu"] = require("../units/apu");

BaseConfig.prototype["dma"] = require("../units/dma");

BaseConfig.prototype["cpuMemory"] = require("../units/cpu-memory");

BaseConfig.prototype["ppuMemory"] = require("../units/ppu-memory");

BaseConfig.prototype["cartridgeFactory"] = require("../factories/cartridge-factory");

BaseConfig.prototype["deviceFactory"] = require("../factories/device-factory");

BaseConfig.prototype["loaderFactory"] = require("../factories/loader-factory");

BaseConfig.prototype["mapperFactory"] = require("../factories/mapper-factory");

BaseConfig.prototype["paletteFactory"] = require("../factories/palette-factory");

module.exports = BaseConfig;
