var AOROMMapper = require("../mappers/aorom-mapper");
var CNROMMapper = require("../mappers/cnrom-mapper");
var MMC1Mapper  = require("../mappers/mmc1-mapper");
var MMC3Mapper  = require("../mappers/mmc3-mapper");
var NROMMapper  = require("../mappers/nrom-mapper");
var UNROMMapper = require("../mappers/unrom-mapper");
var logger      = require("../utils/logger").get();

//=========================================================
// Factory for mapper creation
//=========================================================

class MapperFactory {

    constructor(injector) {
        this.injector = injector;
        this.mappers = {};
        this.mappers[0x00] = NROMMapper;
        this.mappers[0x01] = MMC1Mapper;
        this.mappers[0x02] = UNROMMapper;
        this.mappers[0x03] = CNROMMapper;
        this.mappers[0x04] = MMC3Mapper;
        this.mappers[0x07] = AOROMMapper;
    }

    createMapper(cartridge) {
        var id = cartridge.mapperId;
        var clazz = this.mappers[id];
        if (!clazz) {
            throw new Error(`Unsupported mapper (ID: ${id}).`);
        }
        var mapper = new clazz(cartridge);
        return this.injector.inject(mapper);
    }

}

module.exports = MapperFactory;
