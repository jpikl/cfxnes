import Mapper from './Mapper';

export default class BNROM extends Mapper {

  reset() {
    this.mapPRGROMBank32K(0, 0); // First 32K PRG ROM bank
    this.mapCHRRAMBank8K(0, 0);  // 8K CHR RAM
  }

  write(address, value) {
    this.mapPRGROMBank32K(0, value); // Select 32K PRG ROM bank
  }

}
