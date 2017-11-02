import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class UNROM extends Mapper {

  resetState() {
    this.mapPRGROMBank16K(0, 0);  // Map first 16K PRG ROM bank to $8000
    this.mapPRGROMBank16K(1, -1); // Map last 16K PRG ROM bank to $C000
    this.mapCHRBank8K(0, 0);      // Map 8K CHR RAM to $0000
  }

  write(address, value) {
    this.mapPRGROMBank16K(0, value); // Select 16K PRG ROM bank at $8000
  }

}
