import { AbstractMapper } from "./abstract-mapper";

//=========================================================
// CNROM mapper
//=========================================================

export class CNROMMapper extends AbstractMapper {

    //=========================================================
    // Mapper initialization
    //=========================================================

    constructor(cartridge) {
        super("CNROM", cartridge);
    }

    init(cartridge) {
        super.init(cartridge);
        this.hasPRGRAM = false;
    }

    //=========================================================
    // Mapper reset
    //=========================================================

    reset() {
        this.mapPRGROMBank16K(0,  0); // First 16K PRG ROM bank
        this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank (or mirror of the first one)
        this.mapCHRROMBank8K (0,  0); // First 8K CHR ROM bank
    }

    //=========================================================
    // Mapper writing
    //=========================================================

    write(address, value) {
        this.mapCHRROMBank8K(0, value); // Select 8K CHR ROM bank
    }

}
