import Mapper from './Mapper';

//=========================================================
// NROM mapper
//=========================================================

export default class NROM extends Mapper {

  reset() {
    this.mapPRGROMBank16K(0, 0);  // First 16K PRG ROM bank
    this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank
    this.mapCHRROMBank8K(0, 0);   // 8K CHR ROM
  }

}
