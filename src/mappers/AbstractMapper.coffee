Format  = require "../utils/Format"
Convert = require "../utils/Convert"
Logger = require "../utils/Logger"

logger = Logger.get()
wordAsHex = Format.wordAsHex
readableSize = Format.readableSize
computeMD5 = Convert.computeMD5
bytesToString = Convert.bytesToString
stringToBytes = Convert.stringToBytes

###########################################################
# Base class for PRGROM mappers
###########################################################

class AbstractMapper

    constructor: (cartridge) ->
        logger.info "Constructing mapper"
        @init cartridge
        @createPRGRAM()
        @printPRGRAMInfo()
        @createCHRRAM()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Resetting mapper"
        @reset()
        @resetPRGRAM()
        @resetCHRRAM()

    ###########################################################
    # Mapper initialization / writing
    ###########################################################

    init: (cartridge) ->
        @mirroring = cartridge.mirroring
        @hasPRGRAM = cartridge.hasPRGRAM # Not reliable information on iNES ROMs (should provide mapper itself)
        @hasPRGRAMBattery = cartridge.hasPRGRAMBattery
        @hasCHRRAM = cartridge.hasCHRRAM
        @prgROMSize = cartridge.prgROMSize ? cartridge.prgROM.length
        @prgRAMSize = cartridge.prgRAMSize # Not present on iNES ROMs (should provide mapper itself)
        @chrROMSize = cartridge.chrROMSize ? cartridge.chrROM.length
        @chrRAMSize = cartridge.chrRAMSize
        @prgROM = cartridge.prgROM
        @chrROM = cartridge.chrROM

    reset: ->
        # For mapper to implement.

    write: (address, value) ->
        value # Read-only by default

    ###########################################################
    # PRG ROM mapping
    ###########################################################

    mapPRGROMBank32K: (srcBank, dstBank) ->
        @mapPRGROMBank8K srcBank, dstBank, 4

    mapPRGROMBank16K: (srcBank, dstBank) ->
        @mapPRGROMBank8K srcBank, dstBank, 2

    mapPRGROMBank8K: (srcBank, dstBank, ratio = 1) ->
        srcBank = ratio * srcBank
        dstBank = ratio * dstBank
        maxBank = (@prgROMSize - 1) >> 13
        @cpuMemory.mapPRGROMBank srcBank + i, (dstBank + i) & maxBank for i in [0...ratio]
        undefined

    ###########################################################
    # PRG RAM initialization / mapping
    ###########################################################

    createPRGRAM: ->
        @prgRAM = (0 for i in [0...@prgRAMSize]) if @hasPRGRAM
        undefined

    resetPRGRAM: ->
        @prgRAM[i] = 0 for i in [0...@prgRAMSize] if @hasPRGRAM and not @hasPRGRAMBattery
        undefined

    loadPRGRAM: (storage) ->
        if @hasPRGRAM and @hasPRGRAMBattery
            data = storage.load @getPRGRAMKey()
            stringToBytes data, @prgRAM if data
        undefined

    savePRGRAM: (storage) ->
        if @hasPRGRAM and @hasPRGRAMBattery
            data = bytesToString @prgRAM
            storage.save @getPRGRAMKey(), data
        undefined

    getPRGRAMKey: ->
        @prgRAMKey ?= "nescoffee/#{computeMD5 @prgROM}.sav"

    mapPRGRAMBank8K: (srcBank, dstBank) ->
        maxBank = (@prgRAMSize - 1) >> 13
        @cpuMemory.mapPRGRAMBank srcBank, dstBank & maxBank

    printPRGRAMInfo: ->
        logger.info "==========[Mapper PRG RAM Info - Start]=========="
        logger.info "has PRG RAM        : #{@hasPRGRAM}"
        logger.info "has PRG RAM battery: #{@hasPRGRAMBattery}"
        logger.info "PRG RAM size       : #{readableSize @prgRAMSize}"
        logger.info "==========[Mapper PRG RAM Info - End]=========="

    ###########################################################
    # CHR ROM mapping
    ###########################################################

    mapCHRROMBank8K: (srcBank, dstBank) ->
        @mapCHRROMBank1K srcBank, dstBank, 8

    mapCHRROMBank4K: (srcBank, dstBank) ->
        @mapCHRROMBank1K srcBank, dstBank, 4

    mapCHRROMBank2K: (srcBank, dstBank) ->
        @mapCHRROMBank1K srcBank, dstBank, 2

    mapCHRROMBank1K: (srcBank, dstBank, ratio = 1) ->
        srcBank = ratio * srcBank
        dstBank = ratio * dstBank
        maxBank = (@chrROMSize - 1) >> 10
        @ppuMemory.mapCHRMemoryBank srcBank + i, (dstBank + i) & maxBank for i in [0...ratio]
        undefined

    ###########################################################
    # CHR RAM initialization / mapping
    ###########################################################

    createCHRRAM: ->
        @chrRAM = (0 for i in [0...@chrRAMSize]) if @hasCHRRAM
        undefined

    resetCHRRAM: ->
        @chrRAM[i] = 0 for i in [0...@chrRAMSize] if @hasCHRRAM
        undefined

    mapCHRRAMBank8K: (srcBank, dstBank) ->
        @mapCHRRAMBank4K srcBank, dstBank, 8

    mapCHRRAMBank4K: (srcBank, dstBank, ratio = 4) ->
        srcBank = ratio * srcBank
        dstBank = ratio * dstBank
        maxBank = (@chrRAMSize - 1) >> 10
        @ppuMemory.mapCHRMemoryBank srcBank + i, (dstBank + i) & maxBank for i in [0...ratio]
        undefined

    ###########################################################
    # Names / attributes tables mirroring
    ###########################################################

    setMirroring: (mirroring) ->
        @ppuMemory.setNamesAttrsMirroring mirroring

module.exports = AbstractMapper
