import { Mirroring }               from "../common/mirroring";
import { clearArray }              from "../utils/arrays";
import { wordAsHex, readableSize } from "../utils/format";
import { logger }                  from "../utils/logger";
import { newByteArray }            from "../utils/system";

//=========================================================
// Base class of mappers
//=========================================================

export class AbstractMapper {

    //=========================================================
    // Mapper initialization
    //=========================================================

    constructor(cartridge) {
        this.dependencies = ["cpuMemory", "ppuMemory", "hash"];
        this.init(cartridge);
        this.initPRGRAM();
        this.initCHRRAM();
        this.printPRGRAMInfo();
        this.printCHRRAMInfo();
    }

    init(cartridge) {
        this.submapper = cartridge.submapper; // Not present on iNES ROMs
        this.mirroring = cartridge.mirroring;
        this.hasPRGRAM = cartridge.hasPRGRAM; // Not reliable information on iNES ROMs (should provide mapper itself)
        this.hasPRGRAMBattery = cartridge.hasPRGRAMBattery;
        this.hasCHRRAM = cartridge.hasCHRRAM;
        this.hasCHRRAMBattery = cartridge.hasCHRRAMBattery; // Not present on iNES ROMs
        this.prgROMSize = cartridge.prgROMSize || cartridge.prgROM.length;
        this.prgRAMSize = cartridge.prgRAMSize; // Not reliable information on iNES ROMs (should provide mapper itself)
        this.prgRAMSizeBattery = cartridge.prgRAMSizeBattery; // Not present on iNES ROMs
        this.chrROMSize = cartridge.chrROMSize || cartridge.chrROM.length;
        this.chrRAMSize = cartridge.chrRAMSize;
        this.chrRAMSizeBattery = cartridge.chrRAMSizeBattery; // Not present on iNES ROMs
        this.prgROM = cartridge.prgROM;
        this.chrROM = cartridge.chrROM;
        this.canReadPRGRAM = true; // PRG RAM read protection
        this.canWritePRGRAM = true; // PRG RAM write protection
    }

    inject(cpuMemory, ppuMemory, hash) {
        this.cpuMemory = cpuMemory;
        this.ppuMemory = ppuMemory;
        this.hash = hash;
    }

    //=========================================================
    // Mapper reset
    //=========================================================

    powerUp() {
        logger.info("Resetting mapper");
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
        this.mapPRGROMBank8K(srcBank, dstBank, 4);
    }

    mapPRGROMBank16K(srcBank, dstBank) {
        this.mapPRGROMBank8K(srcBank, dstBank, 2);
    }

    mapPRGROMBank8K(srcBank, dstBank, ratio = 1) {
        var srcBank = ratio * srcBank;
        var dstBank = ratio * dstBank;
        var maxBank = (this.prgROMSize - 1) >> 13;
        for (var i = 0; i < ratio; i++) {
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
            clearArray(this.prgRAM, this.prgRAMSizeBattery || 0); // Keep battery-backed part of PRGRAM
        }
    }

    loadPRGRAM(storage) {
        if (this.hasPRGRAM && this.hasPRGRAMBattery) {
            if (this.hash.available()) {
                storage.readData(this.getPRGRAMKey(), this.prgRAM);
            } else {
                logger.warn("Unable to load PRGRAM: hash function is not available.");
            }
        }
    }

    savePRGRAM(storage) {
        if (this.hasPRGRAM && this.hasPRGRAMBattery) {
            if (this.hash.available()) {
                var data = this.prgRAM.subarray(0, this.prgRAMSizeBattery);
                storage.writeData(this.getPRGRAMKey(), data);
            } else {
                logger.warn("Unable to save PRGRAM: hash function is not available.");
            }
        }
    }

    getPRGRAMKey() {
        if (this.prgRAMKey == null) {
            this.prgRAMKey = this.hash(this.prgROM) + "/PRGRAM";
        }
        return this.prgRAMKey;
    }

    mapPRGRAMBank8K(srcBank, dstBank) {
        var maxBank = (this.prgRAMSize - 1) >> 13;
        this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
    }

    printPRGRAMInfo() {
        logger.info("==========[Mapper PRG RAM Info - Start]==========");
        logger.info("has PRG RAM           : " + this.hasPRGRAM);
        logger.info("has PRG RAM battery   : " + this.hasPRGRAMBattery);
        logger.info("PRG RAM size          : " + readableSize(this.prgRAMSize));
        logger.info("PRG RAM size (battery): " + readableSize(this.prgRAMSizeBattery));
        logger.info("==========[Mapper PRG RAM Info - End]==========");
    }

    //=========================================================
    // CHR ROM mapping
    //=========================================================

    mapCHRROMBank8K(srcBank, dstBank) {
        this.mapCHRROMBank1K(srcBank, dstBank, 8);
    }

    mapCHRROMBank4K(srcBank, dstBank) {
        this.mapCHRROMBank1K(srcBank, dstBank, 4);
    }

    mapCHRROMBank2K(srcBank, dstBank) {
        this.mapCHRROMBank1K(srcBank, dstBank, 2);
    }

    mapCHRROMBank1K(srcBank, dstBank, ratio = 1) {
        var srcBank = ratio * srcBank;
        var dstBank = ratio * dstBank;
        var maxBank = (this.chrROMSize - 1) >> 10;
        for (var i = 0; i < ratio; i++) {
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
            clearArray(this.chrRAM, this.chrRAMSizeBattery || 0); // Keep battery-backed part of CHRRAM
        }
    }

    loadCHRRAM(storage) {
        if (this.hasCHRRAM && this.hasCHRRAMBattery) {
            if (this.hash.available()) {
                storage.readData(this.getCHRRAMKey(), this.chrRAM);
            } else {
                logger.warn("Unable to load CHRRAM: hash function is not available.");
            }
        }
    }

    saveCHRRAM(storage) {
        if (this.hasCHRRAM && this.hasCHRRAMBattery) {
            if (this.hash.available()) {
                var data = this.chrRAM.subarray(0, this.chrRAMSizeBattery);
                storage.writeData(this.getCHRRAMKey(), data);
            } else {
                logger.warn("Unable to save CHRRAM: hash function is not available.");
            }
        }
    }

    getCHRRAMKey() {
        if (this.chrRAMKey == null) {
            this.chrRAMKey = this.hash(this.prgROM) + "/CHRRAM";
        }
        return this.chrRAMKey;
    }

    mapCHRRAMBank8K(srcBank, dstBank) {
        this.mapCHRRAMBank4K(srcBank, dstBank, 8);
    }

    mapCHRRAMBank4K(srcBank, dstBank, ratio = 4) {
        var srcBank = ratio * srcBank;
        var dstBank = ratio * dstBank;
        var maxBank = (this.chrRAMSize - 1) >> 10;
        for (var i = 0; i < ratio; i++) {
            this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
        }
    }

    printCHRRAMInfo() {
        logger.info("==========[Mapper CHR RAM Info - Start]==========");
        logger.info("has CHR RAM           : " + this.hasCHRRAM);
        logger.info("has CHR RAM battery   : " + this.hasCHRRAMBattery);
        logger.info("CHR RAM size          : " + readableSize(this.chrRAMSize));
        logger.info("CHR RAM size (battery): " + readableSize(this.chrRAMSizeBattery));
        logger.info("==========[Mapper CHR RAM Info - End]==========");
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
