import Mirroring from '../common/Mirroring';
import logger from '../utils/logger';
import { zeroArray } from '../utils/arrays';
import { newByteArray } from '../utils/system';
import { formatOptional, formatSize, wordAsHex } from '../utils/format';

//=========================================================
// Base class of mappers
//=========================================================

export default class AbstractMapper {

  //=========================================================
  // Mapper initialization
  //=========================================================

  constructor(cartridge) {
    this.dependencies = ['cpuMemory', 'ppuMemory'];
    this.init(cartridge);
    this.initPRGRAM();
    this.initCHRRAM();
    this.printPRGRAMInfo();
    this.printCHRRAMInfo();
  }

  init(cartridge) {
    this.sha1 = cartridge.sha1;
    this.submapper = cartridge.submapper; // Not present on iNES ROMs
    this.mirroring = cartridge.mirroring;
    this.hasPRGRAM = cartridge.hasPRGRAM; // Not reliable information on iNES ROMs (should provide mapper itself)
    this.hasPRGRAMBattery = cartridge.hasPRGRAMBattery;
    this.hasPRGRAMRegisters = false; // Whether mapper registers are mapped in PRG RAM address space
    this.hasCHRROM = cartridge.hasCHRROM;
    this.hasCHRRAM = cartridge.hasCHRRAM;
    this.hasCHRRAMBattery = cartridge.hasCHRRAMBattery; // Not present on iNES ROMs
    this.prgROMSize = cartridge.prgROMSize;
    this.prgRAMSize = cartridge.prgRAMSize; // Not reliable information on iNES ROMs (should provide mapper itself)
    this.prgRAMSizeBattery = cartridge.prgRAMSizeBattery; // Not present on iNES ROMs
    this.chrROMSize = cartridge.chrROMSize;
    this.chrRAMSize = cartridge.chrRAMSize;
    this.chrRAMSizeBattery = cartridge.chrRAMSizeBattery; // Not present on iNES ROMs
    this.prgROM = cartridge.prgROM;
    this.chrROM = cartridge.chrROM;
    this.canReadPRGRAM = true; // PRG RAM read protection
    this.canWritePRGRAM = true; // PRG RAM write protection
  }

  inject(cpuMemory, ppuMemory) {
    this.cpuMemory = cpuMemory;
    this.ppuMemory = ppuMemory;
  }

  //=========================================================
  // Mapper reset
  //=========================================================

  powerUp() {
    logger.info('Resetting mapper');
    this.resetPRGRAM();
    this.resetCHRRAM();
    this.reset();
  }

  reset() {
    // For mapper to implement
  }

  //=========================================================
  // Mapper inputs
  //=========================================================

  write(address, value) {
    // For mapper to implement
  }

  tick() {
    // For mapper to implement
  }

  //=========================================================
  // PRG ROM mapping
  //=========================================================

  mapPRGROMBank32K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 4, dstBank * 4, 4);
  }

  mapPRGROMBank16K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 2, dstBank * 2, 2);
  }

  mapPRGROMBank8K(srcBank, dstBank, count = 1) {
    var maxBank = (this.prgROMSize - 1) >> 13;
    for (var i = 0; i < count; i++) {
      this.cpuMemory.mapPRGROMBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // PRG RAM mapping
  //=========================================================

  initPRGRAM() {
    if (this.hasPRGRAM) {
      this.prgRAM = newByteArray(this.prgRAMSize);
      if (this.hasPRGRAMBattery && this.prgRAMSizeBattery == null) {
        this.prgRAMSizeBattery = this.prgRAMSize; // If not defined, the whole PRG RAM is battery backed
      }
    }
  }

  resetPRGRAM() {
    if (this.hasPRGRAM) {
      zeroArray(this.prgRAM, this.prgRAMSizeBattery || 0); // Keep battery-backed part of PRGRAM
    }
  }

  loadPRGRAM(storage) {
    if (this.hasPRGRAM && this.hasPRGRAMBattery) {
      if (this.sha1) {
        return storage.readRAM(this.sha1, 'prg', this.prgRAM);
      } else {
        logger.warn('Unable to load PRGRAM: SHA-1 is not available.');
      }
    }
    return Promise.resolve();
  }

  savePRGRAM(storage) {
    if (this.hasPRGRAM && this.hasPRGRAMBattery) {
      if (this.sha1) {
        return storage.writeRAM(this.sha1, 'prg', this.prgRAM.subarray(0, this.prgRAMSizeBattery));
      } else {
        logger.warn('Unable to save PRGRAM: SHA-1 is not available.');
      }
    }
    return Promise.resolve();
  }

  mapPRGRAMBank8K(srcBank, dstBank) {
    var maxBank = (this.prgRAMSize - 1) >> 13;
    this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
  }

  printPRGRAMInfo() {
    logger.info('==========[Mapper PRG RAM Info - Start]==========');
    logger.info('has PRG RAM           : ' + formatOptional(this.hasPRGRAM));
    logger.info('has PRG RAM battery   : ' + formatOptional(this.hasPRGRAMBattery));
    logger.info('PRG RAM size          : ' + formatOptional(formatSize(this.prgRAMSize)));
    logger.info('PRG RAM size (battery): ' + formatOptional(formatSize(this.prgRAMSizeBattery)));
    logger.info('==========[Mapper PRG RAM Info - End]==========');
  }

  //=========================================================
  // CHR ROM mapping
  //=========================================================

  mapCHRROMBank8K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRROMBank4K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRROMBank2K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRROMBank1K(srcBank, dstBank, count = 1) {
    var maxBank = (this.chrROMSize - 1) >> 10;
    for (var i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // CHR RAM mapping
  //=========================================================

  // Note: Only known game using battery-backed CHR RAM is RacerMate Challenge II

  initCHRRAM() {
    if (this.hasCHRRAM) {
      this.chrRAM = newByteArray(this.chrRAMSize);
      if (this.hasCHRRAMBattery && this.chrRAMSizeBattery == null) {
        this.chrRAMSizeBattery = this.chrRAMSize; // If not defined, the whole CHR RAM is battery backed
      }
    }
  }

  resetCHRRAM() {
    if (this.hasCHRRAM) {
      zeroArray(this.chrRAM, this.chrRAMSizeBattery || 0); // Keep battery-backed part of CHRRAM
    }
  }

  loadCHRRAM(storage) {
    if (this.hasCHRRAM && this.hasCHRRAMBattery) {
      if (this.sha1) {
        return storage.readRAM(this.sha1, 'chr', this.chrRAM);
      } else {
        logger.warn('Unable to load CHRRAM: SHA-1 is not available.');
      }
    }
    return Promise.resolve();
  }

  saveCHRRAM(storage) {
    if (this.hasCHRRAM && this.hasCHRRAMBattery) {
      if (this.sha1) {
        return storage.writeRAM(this.sha1, 'chr', this.chrRAM.subarray(0, this.chrRAMSizeBattery));
      } else {
        logger.warn('Unable to save CHRRAM: SHA-1 is not available.');
      }
    }
    return Promise.resolve();
  }

  mapCHRRAMBank8K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRRAMBank4K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRRAMBank2K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRRAMBank1K(srcBank, dstBank, count = 1) {
    var maxBank = (this.chrRAMSize - 1) >> 10;
    for (var i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  printCHRRAMInfo() {
    logger.info('==========[Mapper CHR RAM Info - Start]==========');
    logger.info('has CHR RAM           : ' + formatOptional(this.hasCHRRAM));
    logger.info('has CHR RAM battery   : ' + formatOptional(this.hasCHRRAMBattery));
    logger.info('CHR RAM size          : ' + formatOptional(formatSize(this.chrRAMSize)));
    logger.info('CHR RAM size (battery): ' + formatOptional(formatSize(this.chrRAMSizeBattery)));
    logger.info('==========[Mapper CHR RAM Info - End]==========');
  }

  //=========================================================
  // Names / attribute tables mirroring
  //=========================================================

  setSingleScreenMirroring(area = 0) {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.getSingleScreen(area));
  }

  setVerticalMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.VERTICAL);
  }

  setHorizontalMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.HORIZONTAL);
  }

  setFourScreenMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.FOUR_SCREEN);
  }

  setMirroring(area0, area1, area2, area3) {
    this.ppuMemory.mapNamesAttrsAreas([area0, area1, area2, area3]);
  }

}
