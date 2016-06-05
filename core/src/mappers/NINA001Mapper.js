import AbstractMapper from './AbstractMapper';

//=========================================================
// NINA-001 mapper
//=========================================================

export default class NINA001Mapper extends AbstractMapper {

  init(cartridge) {
    super.init(cartridge);
    this.hasPRGRAMRegisters = true; // Registers are mapped to PRG RAM address space
  }

  reset() {
    this.mapPRGROMBank32K(0, 0); // First 32K PRG ROM bank
    this.mapPRGRAMBank8K(0, 0);  // 8K PRG RAM
    this.mapCHRROMBank8K(0, 0);  // First 8K CHR ROM bank
  }

  write(address, value) {
    switch (address) {
      case 0x7FFD: this.mapPRGROMBank32K(0, value); break; // Select 32K PRG ROM bank
      case 0x7FFE: this.mapCHRROMBank4K(0, value); break;  // Select 4K CHR ROM bank at $0000
      case 0x7FFF: this.mapCHRROMBank4K(1, value); break;  // Select 4K CHR ROM bank at $1000
    }
  }

}
