import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class CnRom extends Mapper {

  resetState() {
    this.mapPrgRomBank16K(0, 0);  // Map first 16K PRG ROM bank to $8000
    this.mapPrgRomBank16K(1, -1); // Map last 16K PRG ROM bank (or mirror the first one) to $C000
    this.mapChrBank8K(0, 0);      // Map first 8K CHR ROM bank to $0000
  }

  write(address, value) {
    this.mapChrBank8K(0, value); // Select 8K CHR ROM bank at $0000
  }

}
