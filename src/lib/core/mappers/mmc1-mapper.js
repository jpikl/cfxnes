import { AbstractMapper } from "./abstract-mapper";

//=========================================================
// MMC1 mapper
//=========================================================

export class MMC1Mapper extends AbstractMapper {

    //=========================================================
    // Mapper initialization
    //=========================================================

    init(cartridge) {
        super.init(cartridge);
        this.hasPRGRAM = true;    // Depends on board, so we presume PRG RAM is present
        this.prgRAMSize = 0x8000; // Depends on board, the largest value is 32K on SXROM
    }

    //=========================================================
    // Mapper reset
    //=========================================================

    reset() {
        this.resetShiftRegister();
        this.resetBankRegisters();
        this.synchronizeMapping();
    }

    resetShiftRegister() {
        this.shiftRegister = 0; // 5-bit (shifts to right, writes are to bit 4)
        this.writesCount = 0;   // Counts 5 writes to fill shift register
    }

    resetBankRegisters() {
        this.controllRegister = 0x0C; // 5-bit - mapper configuration
        this.prgBankRegister = 0;     // 5-bit - selects lower/upper 16K PRG ROM bank within a 256K page
        this.chrBankRegister1 = 0;    // 5-bit - selects lower 4K CHR ROM bank
        this.chrBankRegister2 = 0;    // 5-bit - selects upper 4K CHR ROM bank
    }

    //=========================================================
    // Mapper writing
    //=========================================================

    write(address, value) {
        if (value & 0x80) {
            this.resetShiftRegister();
            this.controllRegister = this.controllRegister | 0x0C;
        } else {
            this.shiftRegister |= (value & 1) << this.writesCount;
            if (++this.writesCount >= 5) {
                this.copyShiftRegister(address);
                this.resetShiftRegister();
                this.synchronizeMapping();
            }
        }
    }

    copyShiftRegister(address) {
        switch (address & 0xE000) {
            case 0x8000: this.controllRegister = this.shiftRegister; break; // $8000-$9FFF (100X)
            case 0xA000: this.chrBankRegister1 = this.shiftRegister; break; // $A000-$BFFF (101X)
            case 0xC000: this.chrBankRegister2 = this.shiftRegister; break; // $C000-$DFFF (110X)
            case 0xE000: this.prgBankRegister  = this.shiftRegister; break; // $E000-$FFFF (111X)
        }
    }

    //=========================================================
    // Mapper reconfiguration
    //=========================================================

    synchronizeMapping() {
        this.switchMirroring();
        this.switchPRGROMBanks();
        if (this.hasPRGRAM) {
            this.switchPRGRAMBank();
        }
        if (this.hasCHRRAM) {
            this.switchCHRRAMBanks();
        } else {
            this.switchCHRROMBanks();
        }
    }

    switchMirroring() {
        switch (this.controllRegister & 0x03) {
            case 0: this.setSingleScreenMirroring(0); break;
            case 1: this.setSingleScreenMirroring(1); break;
            case 2: this.setVerticalMirroring();      break;
            case 3: this.setHorizontalMirroring();    break;
        }
    }

    switchPRGROMBanks() {
        var base = this.chrBankRegister1 & 0x10;  // Selection of 256K page on 512K PRG ROM
        var offset = this.prgBankRegister & 0x0F; // 16K bank selection within 256K page
        switch (this.controllRegister & 0x0C) {
            case 0x0C:
                this.mapPRGROMBank16K(0, base | offset); // Selected 16K PRG ROM bank
                this.mapPRGROMBank16K(1, base | 0x0F);   // Last 16K PRG ROM bank
                break;
            case 0x08:
                this.mapPRGROMBank16K(0, base);          // First 16K PRG ROM bank
                this.mapPRGROMBank16K(1, base | offset); // Selected 16K PRG ROM bank
                break;
            default:
                this.mapPRGROMBank32K(0, base | offset >>> 1); // Selected 32K PRG ROM
                break;
        }
    }

    switchPRGRAMBank() {
        this.mapPRGRAMBank8K(0, this.chrBankRegister1 >>> 2); // Selected 8K PRG RAM bank
    }

    switchCHRROMBanks() {
        if (this.controllRegister & 0x10) {
            this.mapCHRROMBank4K(0, this.chrBankRegister1); // Selected lower 4K CHR ROM bank
            this.mapCHRROMBank4K(1, this.chrBankRegister2); // Selected upper 4K CHR ROM bank
        } else {
            this.mapCHRROMBank8K(0, this.chrBankRegister1 >>> 1); // Selected 8K CHR ROM bank
        }
    }

    switchCHRRAMBanks() {
        if (this.controllRegister & 0x10) {
            this.mapCHRRAMBank4K(0, this.chrBankRegister1); // Selected lower 4K CHR RAM bank
            this.mapCHRRAMBank4K(1, this.chrBankRegister2); // Selected upper 4K CHR RAM bank
        } else {
            this.mapCHRRAMBank8K(0, 0); // Whole 8K CHR RAM
        }
    }

}
