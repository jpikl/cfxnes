import { AbstractMapper } from "./abstract-mapper";

//=========================================================
// UNROM mapper
//=========================================================

export class UNROMMapper extends AbstractMapper {

    //=========================================================
    // Mapper initialization
    //=========================================================

    init(cartridge) {
        super.init(cartridge);
        this.hasPRGRAM = false;
    }

    //=========================================================
    // Mapper reset
    //=========================================================

    reset() {
        this.mapPRGROMBank16K(0,  0); // First 16K PRG ROM bank
        this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank
        this.mapCHRRAMBank8K (0,  0); // 8K CHR RAM
    }

    //=========================================================
    // Mapper writing
    //=========================================================

    write(address, value) {
        this.mapPRGROMBank16K(0, value); // Select lower 16K PRG ROM bank
    }

}
