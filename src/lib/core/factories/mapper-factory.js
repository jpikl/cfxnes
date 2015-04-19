import { AOROMMapper } from "../mappers/aorom-mapper";
import { CNROMMapper } from "../mappers/cnrom-mapper";
import { MMC1Mapper }  from "../mappers/mmc1-mapper";
import { MMC3Mapper }  from "../mappers/mmc3-mapper";
import { NROMMapper }  from "../mappers/nrom-mapper";
import { UNROMMapper } from "../mappers/unrom-mapper";
import { logger }      from "../utils/logger";

var mappers = {
    0x00: NROMMapper,
    0x01: MMC1Mapper,
    0x02: UNROMMapper,
    0x03: CNROMMapper,
    0x04: MMC3Mapper,
    0x07: AOROMMapper
}

//=========================================================
// Factory for mapper creation
//=========================================================

export class MapperFactory {

    constructor(injector) {
        this.injector = injector;
    }

    createMapper(cartridge) {
        var id = cartridge.mapperId;
        var clazz = mappers[id];
        if (!clazz) {
            throw new Error(`Unsupported mapper (ID: ${id}).`);
        }
        var mapper = new clazz(cartridge);
        return this.injector.inject(mapper);
    }

}
