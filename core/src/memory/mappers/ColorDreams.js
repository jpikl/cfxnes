import Mapper from './Mapper';

/**
 * @extends Mapper
 */
export default class ColorDreams extends Mapper {

  resetState() {
    this.mapPRGROMBank32K(0, 0); // Map first 32K PRG ROM bank to $8000
    this.mapCHRBank8K(0, 0);     // Map first 8K CHR RAM to $0000
  }

  write(address, value) {
    this.mapPRGROMBank32K(0, value);   // Select 32K PRG ROM bank at $8000 (bits 0-1)
    this.mapCHRBank8K(0, value >>> 4); // Select 8K CHR ROM bank at $0000 (bits 4-7)
  }

}
