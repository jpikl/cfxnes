import Mapper from './Mapper';

//=========================================================
// UNROM mapper
//=========================================================

export default class UNROM extends Mapper {

  reset() {
    this.mapPRGROMBank16K(0, 0);  // First 16K PRG ROM bank
    this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank
    this.mapCHRRAMBank8K(0, 0);   // 8K CHR RAM
  }

  write(address, value) {
    this.mapPRGROMBank16K(0, value); // Select lower 16K PRG ROM bank
  }

}
