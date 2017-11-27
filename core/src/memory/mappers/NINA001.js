import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class NINA001 extends Mapper {

  constructor(mapper) {
    super(mapper);
    this.hasPRGRAMRegisters = true; // Registers are mapped to PRG RAM address space
  }

  resetState() {
    this.mapPRGROMBank32K(0, 0); // Map first 32K PRG ROM bank to $8000
    this.mapPRGRAMBank8K(0, 0);  // Map 8K PRG RAM to $6000
    this.mapCHRBank8K(0, 0);     // Map first 8K CHR ROM bank to $0000
  }

  write(address, value) {
    switch (address) {
      case 0x7FFD: this.mapPRGROMBank32K(0, value); break; // Select 32K PRG ROM bank at $8000
      case 0x7FFE: this.mapCHRBank4K(0, value); break;     // Select 4K CHR ROM bank at $0000
      case 0x7FFF: this.mapCHRBank4K(1, value); break;     // Select 4K CHR ROM bank at $1000
    }
  }

}
