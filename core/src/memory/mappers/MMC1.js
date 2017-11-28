import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class MMC1 extends Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(mapper) {
    super(mapper);

    // Shift registers
    this.shiftRegister = 0; // 5-bit (shifts to right, writes are to bit 4)
    this.writesCount = 0;   // Counts 5 writes to fill shift register

    // Bank registers
    this.controlRegister = 0;  // 5-bit (mapper configuration)
    this.prgBankRegister = 0;  // 5-bit (selects lower/upper 16K PRG ROM bank within a 256K page)
    this.chrBankRegister1 = 0; // 5-bit (selects lower 4K CHR ROM bank)
    this.chrBankRegister2 = 0; // 5-bit (selects upper 4K CHR ROM bank)

    // SNROM board detection (128/256 KB PRG ROM + 8 KB PRG RAM + 8 KB CHR RAM/ROM)
    this.snrom = (this.prgROMSize === 0x20000 || this.prgROMSize === 0x40000)
      && this.prgRAMSize === 0x2000
      && (this.chrROMSize === 0x2000 || this.chrRAMSize === 0x2000);
  }

  //=========================================================
  // Reset
  //=========================================================

  resetState() {
    this.resetShiftRegister();
    this.resetBankRegisters();
    this.synchronizeMapping();
  }

  resetShiftRegister() {
    this.shiftRegister = 0;
    this.writesCount = 0;
  }

  resetBankRegisters() {
    this.controlRegister = 0x0C;
    this.prgBankRegister = 0;
    this.chrBankRegister1 = 0;
    this.chrBankRegister2 = 0;
  }

  //=========================================================
  // Writing
  //=========================================================

  write(address, value) {
    if (value & 0x80) {
      this.resetShiftRegister();
      this.controlRegister |= 0x0C;
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
      case 0x8000: this.controlRegister = this.shiftRegister; break; // $8000-$9FFF (100X)
      case 0xA000: this.chrBankRegister1 = this.shiftRegister; break; // $A000-$BFFF (101X)
      case 0xC000: this.chrBankRegister2 = this.shiftRegister; break; // $C000-$DFFF (110X)
      case 0xE000: this.prgBankRegister = this.shiftRegister; break;  // $E000-$FFFF (111X)
    }
  }

  //=========================================================
  // Bank switching
  //=========================================================

  synchronizeMapping() {
    this.switchMirroring();
    this.switchPRGROMBanks();
    this.switchPRGRAMBank();
    this.switchCHRBanks();
  }

  switchMirroring() {
    switch (this.controlRegister & 0x03) {
      case 0: this.setSingleScreenMirroring(0); break;
      case 1: this.setSingleScreenMirroring(1); break;
      case 2: this.setVerticalMirroring(); break;
      case 3: this.setHorizontalMirroring(); break;
    }
  }

  switchPRGROMBanks() {
    // Bit 4 of CHR bank register has different usage when 8KB CHR RAM is present (SNROM, SOROM, SUROM and SXROM boards)
    const base = this.chrRAM ? this.chrBankRegister1 & 0x10 : 0; // Selection of 256K area on 512K PRG ROM (won't affect SNROM/SOROM with max. 256KB PRG ROM)
    const offset = this.prgBankRegister & 0x0F; // 16K bank selection within 256K area

    switch (this.controlRegister & 0x0C) {
      case 0x0C:
        this.mapPRGROMBank16K(0, base | offset); // Select 16K PRG ROM bank at $8000
        this.mapPRGROMBank16K(1, base | 0x0F);   // Map last 16K PRG ROM bank to $C000
        break;

      case 0x08:
        this.mapPRGROMBank16K(0, base);          // Map first 16K PRG ROM bank to $8000
        this.mapPRGROMBank16K(1, base | offset); // Select 16K PRG ROM bank at $C000
        break;

      default:
        this.mapPRGROMBank32K(0, (base | offset) >>> 1); // Select 32K PRG ROM at $8000
        break;
    }
  }

  switchPRGRAMBank() {
    const enabled = (this.prgBankRegister & 0x10) === 0; // Ignored on MMC1A (iNES mapper 155)
    const enabledOnSNROM = (this.chrBankRegister1 & 0x10) === 0; // SNROM board also disables PRG RAM when bit 4 of CHR bank register is 1
    const canAccessPRGRAM = enabled && (!this.snrom || enabledOnSNROM);

    // Bits 2 and 3 of CHR bank register have different usage when 8KB CHR RAM is present (SNROM, SOROM, SUROM and SXROM boards)
    this.mapPRGRAMBank8K(0, this.chrRAM ? this.chrBankRegister1 >>> 2 : 0); // Select 8K PRG RAM bank at $6000 (won't affect SNROM/SUROM with only 8KB PRG RAM)
    this.canReadPRGRAM = canAccessPRGRAM;
    this.canWritePRGRAM = canAccessPRGRAM;
  }

  switchCHRBanks() {
    if (this.controlRegister & 0x10) {
      this.mapCHRBank4K(0, this.chrBankRegister1); // Select 4K CHR bank at $0000
      this.mapCHRBank4K(1, this.chrBankRegister2); // Select 4K CHR bank at $1000
    } else {
      this.mapCHRBank8K(0, this.chrBankRegister1 >>> 1); // Select 8K CHR bank at $0000 (won't affect variants with 8K CHR RAM)
    }
  }

}
