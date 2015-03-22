import { AOROMMapper } from "../mappers/aorom-mapper";
import { CNROMMapper } from "../mappers/cnrom-mapper";
import { MMC1Mapper } from "../mappers/mmc1-mapper";
import { MMC3Mapper } from "../mappers/mmc3-mapper";
import { NROMMapper } from "../mappers/nrom-mapper";
import { UNROMMapper } from "../mappers/unrom-mapper";
import { logger } from "../utils/logger";

//=========================================================
// Factory for mapper creation
//=========================================================

export class MapperFactory {

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
