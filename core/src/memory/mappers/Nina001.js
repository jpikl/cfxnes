import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class Nina001 extends Mapper {

  constructor(mapper) {
    super(mapper);
    this.hasPrgRamRegisters = true; // Registers are mapped to PRG RAM address space
  }

  resetState() {
    this.mapPrgRomBank32K(0, 0); // Map first 32K PRG ROM bank to $8000
    this.mapPrgRamBank8K(0, 0);  // Map 8K PRG RAM to $6000
    this.mapChrBank8K(0, 0);     // Map first 8K CHR ROM bank to $0000
  }

  write(address, value) {
    switch (address) {
      case 0x7FFD: this.mapPrgRomBank32K(0, value); break; // Select 32K PRG ROM bank at $8000
      case 0x7FFE: this.mapChrBank4K(0, value); break;     // Select 4K CHR ROM bank at $0000
      case 0x7FFF: this.mapChrBank4K(1, value); break;     // Select 4K CHR ROM bank at $1000
    }
  }

}
