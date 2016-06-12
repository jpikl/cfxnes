import Mapper from './Mapper';

export default class AOROM extends Mapper {

  reset() {
    this.mapPRGROMBank32K(0, 0); // First 32K PRG ROM bank
    this.mapCHRRAMBank8K(0, 0);  // 8K CHR RAM
  }

  write(address, value) {
    this.mapPRGROMBank32K(0, value);                     // Select 32K PRG ROM bank
    this.setSingleScreenMirroring((value & 0x10) >>> 4); // Select single screen mirroring area
  }

}
