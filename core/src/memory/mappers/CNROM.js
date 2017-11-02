import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class CNROM extends Mapper {

  resetState() {
    this.mapPRGROMBank16K(0, 0);  // Map first 16K PRG ROM bank to $8000
    this.mapPRGROMBank16K(1, -1); // Map last 16K PRG ROM bank (or mirror the first one) to $C000
    this.mapCHRBank8K(0, 0);      // Map first 8K CHR ROM bank to $0000
  }

  write(address, value) {
    this.mapCHRBank8K(0, value); // Select 8K CHR ROM bank at $0000
  }

}
