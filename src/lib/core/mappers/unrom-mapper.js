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
        this.hasPRGRAM = true;
        this.prgRAMSize = 0x2000; // 8K PRG RAM
    }

    //=========================================================
    // Mapper reset
    //=========================================================

    reset() {
        this.mapPRGROMBank16K(0,  0); // First 16K PRG ROM bank
        this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank
        this.mapPRGRAMBank8K (0,  0); // 8K PRG RAM
        this.mapCHRRAMBank8K (0,  0); // 8K CHR RAM
    }

    //=========================================================
    // Mapper writing
    //=========================================================

    write(address, value) {
        this.mapPRGROMBank16K(0, value); // Select lower 16K PRG ROM bank
    }

}
