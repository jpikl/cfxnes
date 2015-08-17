import { Mirroring }              from "../common/mirroring";
import { Region }                 from "../common/region";
import { INESLoader }             from "../loaders/ines-loader";
import { NES2Loader }             from "../loaders/nes2-loader";
import { ArrayBufferReader }      from "../readers/array-buffer-reader";
import { LocalFileReader }        from "../readers/local-file-reader";
import { formatOptional,
         formatSize, formatData } from "../utils/format";
import { logger }                 from "../utils/logger";

var loaders = [
    new NES2Loader, // Must be processed before iNES
    new INESLoader
]

//=========================================================
// Factory for cartridge creation
//=========================================================

export class CartridgeFactory {

    constructor() {
        this.dependencies = ["jszip"];
    }

    inject(JSZip) {
        this.JSZip = JSZip;
    }

    fromArrayBuffer(buffer) {
        logger.info("Loading cartridge from array buffer");
        return this.fromReader(new ArrayBufferReader(buffer));
    }

    fromLocalFile(path) {
        logger.info(`Loading cartridge from '${path}'`);
        return this.fromReader(new LocalFileReader(path));
    }

    fromReader(reader) {
        reader.tryUnzip(this.JSZip);
        for (var loader of loaders) {
            if (loader.supports(reader)) {
                logger.info(`Using '${loader.name}' loader`);
                var cartridge = loader.load(reader);
                this.printCartridgeInfo(cartridge);
                return cartridge;
            }
        }
        throw new Error("Unsupported input data format.");
    }

    printCartridgeInfo(cartridge) {
        logger.info("==========[Cartridge Info - Start]==========");
        logger.info("Mapper                : " + formatOptional(cartridge.mapper));
        logger.info("Submapper             : " + formatOptional(cartridge.submapper));
        logger.info("has PRG RAM           : " + formatOptional(cartridge.hasPRGRAM));
        logger.info("has PRG RAM battery   : " + formatOptional(cartridge.hasPRGRAMBattery));
        logger.info("has CHR RAM           : " + formatOptional(cartridge.hasCHRRAM));
        logger.info("has CHR RAM battery   : " + formatOptional(cartridge.hasCHRRAMBattery));
        logger.info("has trainer           : " + formatOptional(cartridge.hasTrainer));
        logger.info("PRG ROM size          : " + formatOptional(formatSize(cartridge.prgROMSize)));
        logger.info("PRG RAM size          : " + formatOptional(formatSize(cartridge.prgRAMSize)));
        logger.info("PRG RAM size (battery): " + formatOptional(formatSize(cartridge.prgRAMSizeBattery)));
        logger.info("CHR ROM size          : " + formatOptional(formatSize(cartridge.chrROMSize)));
        logger.info("CHR RAM size          : " + formatOptional(formatSize(cartridge.chrRAMSize)));
        logger.info("CHR RAM size (battery): " + formatOptional(formatSize(cartridge.chrRAMSizeBattery)));
        logger.info("Mirroring             : " + formatOptional(Mirroring.toString(cartridge.mirroring)));
        logger.info("Region                : " + formatOptional(Region.toString(cartridge.region)));
        logger.info("is Vs Unisistem       : " + formatOptional(cartridge.isVsUnisistem));
        logger.info("is PlayChoice         : " + formatOptional(cartridge.isPlayChoice));
        logger.info("Trainer               : " + formatOptional(formatData(cartridge.trainer)));
        logger.info("==========[Cartridge Info - End]==========");
    }

}
