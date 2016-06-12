import Mapper from './Mapper';

export default class ColorDreams extends Mapper {

  reset() {
    this.mapPRGROMBank32K(0, 0); // First 32K PRG ROM bank
    this.mapCHRROMBank8K(0, 0);  // 8K CHR RAM
  }

  write(address, value) {
    this.mapPRGROMBank32K(0, value);      // Select 32K PRG ROM bank (bits 0-1)
    this.mapCHRROMBank8K(0, value >>> 4); // Select 8K CHR ROM bank (bits 4-7)
  }

}
