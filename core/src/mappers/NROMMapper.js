import AbstractMapper from './AbstractMapper';

//=========================================================
// NROM mapper
//=========================================================

export default class NROMMapper extends AbstractMapper {

  //=========================================================
  // Mapper reset
  //=========================================================

  reset() {
    this.mapPRGROMBank16K(0,  0); // First 16K PRG ROM bank
    this.mapPRGROMBank16K(1, -1); // Last 16K PRG ROM bank
    this.mapCHRROMBank8K(0,  0);  // 8K CHR ROM
  }

}
