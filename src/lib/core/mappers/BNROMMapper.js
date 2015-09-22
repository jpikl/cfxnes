import AbstractMapper from './AbstractMapper';

//=========================================================
// BNROM mapper
//=========================================================

export default class BNROMMapper extends AbstractMapper {

  //=========================================================
  // Mapper reset
  //=========================================================

  reset() {
    this.mapPRGROMBank32K(0, 0); // First 32K PRG ROM bank
    this.mapCHRRAMBank8K(0, 0);  // 8K CHR RAM
  }

  //=========================================================
  // Mapper writing
  //=========================================================

  write(address, value) {
    this.mapPRGROMBank32K(0, value); // Select 32K PRG ROM bank
  }

}
