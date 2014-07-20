logger = require "../common/logger"

types  = require "../common/types"
tvSystemToString = types.TVSystem.toString
mirroringToString = types.Mirroring.toString

format = require "../utils/format"
readableSize = format.readableSize
readableBytes = format.readableBytes

###########################################################
# Factory for cartridge creation
###########################################################

class CartridgeFactory

    @inject: [ "loaderFactory" ]

    inject: (loaderFactory) ->
        @loaderFactory = loaderFactory

    fromArrayBuffer: (arrayBuffer) ->
        ArrayBufferReader = require "../readers/array-buffer-reader"
        @fromReader new ArrayBufferReader arrayBuffer

    fromLocalFile: (filePath) ->
        LocalFileReader   = require "../readers/local-file-reader"
        @fromReader new LocalFileReader filePath

    fromReader: (reader) ->
        loader = @loaderFactory.createLoader reader
        cartridge = loader.loadCartridge()
        @printCartridgeInfo cartridge
        cartridge

    printCartridgeInfo: (cartridge) ->
        logger.info "==========[Cartridge Info - Start]=========="
        logger.info "Mapper ID             : #{cartridge.mapperId}"
        logger.info "Sub-mapper ID         : #{cartridge.subMapperId}"
        logger.info "has PRG RAM           : #{cartridge.hasPRGRAM}"
        logger.info "has PRG RAM battery   : #{cartridge.hasPRGRAMBattery}"
        logger.info "has CHR RAM           : #{cartridge.hasCHRRAM}"
        logger.info "has CHR RAM battery   : #{cartridge.hasCHRRAMBattery}"
        logger.info "has BUS conflicts     : #{cartridge.hasBUSConflicts}"
        logger.info "has trainer           : #{cartridge.hasTrainer}"
        logger.info "PRG ROM size          : #{readableSize cartridge.prgROMSize ? cartridge.prgROM.length}"
        logger.info "PRG RAM size          : #{readableSize cartridge.prgRAMSize}"
        logger.info "PRG RAM size (battery): #{readableSize cartridge.prgRAMSizeBattery}"
        logger.info "CHR ROM size          : #{readableSize cartridge.chrROMSize ? cartridge.chrROM.length}"
        logger.info "CHR RAM size          : #{readableSize cartridge.chrRAMSize}"
        logger.info "CHR RAM size (battery): #{readableSize cartridge.chrRAMSizeBattery}"
        logger.info "Mirroring             : #{mirroringToString cartridge.mirroring}"
        logger.info "TV system             : #{tvSystemToString cartridge.tvSystem}"
        logger.info "is Vs Unisistem       : #{cartridge.isVsUnisistem}"
        logger.info "is PlayChoice         : #{cartridge.isPlayChoice}"
        logger.info "Trainer               : #{readableBytes cartridge.trainer}"
        logger.info "==========[Cartridge Info - End]=========="

module.exports = CartridgeFactory
