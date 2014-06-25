logger = require "../common/logger"

types = require "../common/types"
Mirroring = types.Mirroring

format  = require "../utils/format"
wordAsHex = format.wordAsHex
readableSize = format.readableSize

convert = require "../utils/convert"
computeMD5 = convert.computeMD5
bytesToString = convert.bytesToString
stringToBytes = convert.stringToBytes

###########################################################
# Base class for PRGROM mappers
###########################################################

class AbstractMapper

    constructor: (cartridge) ->
        logger.info "Constructing mapper"
        @init cartridge
        @createPRGRAM()
        @createCHRRAM()
        @printPRGRAMInfo()
        @printCHRRAMInfo()

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
        @hasPRGRAM = cartridge.hasPRGRAM                 # Not reliable information on iNES ROMs (should provide mapper itself)
        @hasPRGRAMBattery = cartridge.hasPRGRAMBattery
        @hasCHRRAM = cartridge.hasCHRRAM
        @hasCHRRAMBattery = cartridge.hasCHRRAMBattery   # Not present on iNES ROMs
        @prgROMSize = cartridge.prgROMSize ? cartridge.prgROM.length
        @prgRAMSize = cartridge.prgRAMSize               # Not present on iNES ROMs (should provide mapper itself)
        @prgRAMSizeBattery = cartridge.prgRAMSizeBattery # Not present on iNES ROMs
        @chrROMSize = cartridge.chrROMSize ? cartridge.chrROM.length
        @chrRAMSize = cartridge.chrRAMSize
        @chrRAMSizeBattery = cartridge.chrRAMSizeBattery # Not present on iNES ROMs
        @prgROM = cartridge.prgROM
        @chrROM = cartridge.chrROM

    reset: ->
        # For mapper to implement

    write: (address, value) ->
        value # Read-only by default

    tick: ->
        # For mapper to implement

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
        if @hasPRGRAM
            @prgRAM = (0 for i in [0...@prgRAMSize])
            if @hasPRGRAMBattery and not @prgRAMSizeBattery?
                @prgRAMSizeBattery = @prgRAMSize # If not defined, the whole PRG RAM is battery backed
        undefined

    resetPRGRAM: ->
        if @hasPRGRAM
            clearFrom = if @hasPRGRAMBattery then @prgRAMSizeBattery else 0
            @prgRAM[i] = 0 for i in [clearFrom...@prgRAMSize]
        undefined

    loadPRGRAM: (storage) ->
        if @hasPRGRAM and @hasPRGRAMBattery
            data = storage.load @getPRGRAMKey()
            stringToBytes data, @prgRAM if data
        undefined

    savePRGRAM: (storage) ->
        if @hasPRGRAM and @hasPRGRAMBattery
            data = bytesToString @prgRAM[0...@prgRAMSizeBattery]
            storage.save @getPRGRAMKey(), data
        undefined

    getPRGRAMKey: ->
        @prgRAMKey ?= "NESCoffee/PRGRAM/#{computeMD5 @prgROM}"

    mapPRGRAMBank8K: (srcBank, dstBank) ->
        maxBank = (@prgRAMSize - 1) >> 13
        @cpuMemory.mapPRGRAMBank srcBank, dstBank & maxBank

    printPRGRAMInfo: ->
        logger.info "==========[Mapper PRG RAM Info - Start]=========="
        logger.info "has PRG RAM           : #{@hasPRGRAM}"
        logger.info "has PRG RAM battery   : #{@hasPRGRAMBattery}"
        logger.info "PRG RAM size          : #{readableSize @prgRAMSize}"
        logger.info "PRG RAM size (battery): #{readableSize @prgRAMSizeBattery}"
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

    # Note: Only known game using battery-backed CHR RAM is RacerMate Challenge II

    createCHRRAM: ->
        if @hasCHRRAM
            @chrRAM = (0 for i in [0...@chrRAMSize])
            if @hasCHRRAMBattery and not @chrRAMSizeBattery?
                @chrRAMSizeBattery = @chrRAMSize # If not defined, the whole CHR RAM is battery backed
        undefined

    resetCHRRAM: ->
        if @hasCHRRAM
            clearFrom = if @hasCHRRAMBattery then @chrRAMSizeBattery else 0
            @chrRAM[i] = 0 for i in [clearFrom...@chrRAMSize]
        undefined

    loadCHRRAM: (storage) ->
        if @hasCHRRAM and @hasCHRRAMBattery
            data = storage.load @getCHRRAMKey()
            stringToBytes data, @chrRAM if data
        undefined

    saveCHRRAM: (storage) ->
        if @hasCHRRAM and @hasCHRRAMBattery
            data = bytesToString @chrRAM[0...@chrRAMSizeBattery]
            storage.save @getCHRRAMKey(), data
        undefined

    getCHRRAMKey: ->
        @chrRAMKey ?= "NESCoffee/CHRRAM/#{computeMD5 @prgROM}"

    mapCHRRAMBank8K: (srcBank, dstBank) ->
        @mapCHRRAMBank4K srcBank, dstBank, 8

    mapCHRRAMBank4K: (srcBank, dstBank, ratio = 4) ->
        srcBank = ratio * srcBank
        dstBank = ratio * dstBank
        maxBank = (@chrRAMSize - 1) >> 10
        @ppuMemory.mapCHRMemoryBank srcBank + i, (dstBank + i) & maxBank for i in [0...ratio]
        undefined

    printCHRRAMInfo: ->
        logger.info "==========[Mapper CHR RAM Info - Start]=========="
        logger.info "has CHR RAM           : #{@hasCHRRAM}"
        logger.info "has CHR RAM battery   : #{@hasCHRRAMBattery}"
        logger.info "CHR RAM size          : #{readableSize @chrRAMSize}"
        logger.info "CHR RAM size (battery): #{readableSize @chrRAMSizeBattery}"
        logger.info "==========[Mapper CHR RAM Info - End]=========="

    ###########################################################
    # Names / attributes tables mirroring
    ###########################################################

    setSingleScreenMirroring: (area = 0) ->
        @ppuMemory.setNamesAttrsMirroring Mirroring.getSingleScreen(area)

    setVerticalMirroring: ->
        @ppuMemory.setNamesAttrsMirroring Mirroring.VERTICAL

    setHorizontalMirroring: ->
        @ppuMemory.setNamesAttrsMirroring Mirroring.HORIZONTAL

    setFourScreenMirroring: ->
        @ppuMemory.setNamesAttrsMirroring Mirroring.FOUR_SCREEN

    setMirroring: (area0, area1, area2, area3) ->
        @ppuMemory.mapNamesAttrsAreas area0, area1, area2, area3

module.exports = AbstractMapper
