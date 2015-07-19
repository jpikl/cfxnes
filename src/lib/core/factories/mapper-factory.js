import { AOROMMapper } from "../mappers/aorom-mapper";
import { CNROMMapper } from "../mappers/cnrom-mapper";
import { MMC1Mapper }  from "../mappers/mmc1-mapper";
import { MMC3Mapper }  from "../mappers/mmc3-mapper";
import { NROMMapper }  from "../mappers/nrom-mapper";
import { UNROMMapper } from "../mappers/unrom-mapper";
import { logger }      from "../utils/logger";

var mappers = {
    "NROM":  NROMMapper,
    "MMC1":  MMC1Mapper,
    "UNROM": UNROMMapper,
    "CNROM": CNROMMapper,
    "MMC3":  MMC3Mapper,
    "AOROM": AOROMMapper
}

//=========================================================
// Factory for mapper creation
//=========================================================

export class MapperFactory {

    constructor(injector) {
        this.injector = injector;
    }

    createMapper(cartridge) {
        var name = cartridge.mapper;
        var clazz = mappers[name];
        if (!clazz) {
            throw new Error(`Unsupported mapper '${name}'`);
        }
        logger.info(`Creating '${name}' mapper`);
        var mapper = new clazz(cartridge);
        return this.injector.inject(mapper);
    }

}
