Format =  require "../utils/Format"

wordAsHex = Format.wordAsHex

###########################################################
# Base class for PRGROM mappers
###########################################################

class AbstractMapper

    constructor: (cartridge) ->
        @init cartridge
        @createPRGRAM()
        @createCHRRAM()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @reset()
        @resetPRGRAM()
        @resetCHRRAM()

    ###########################################################
    # Mapper initialization / writing
    ###########################################################

    init: (cartridge) ->
        @mirroring = cartridge.mirroring
        @hasPRGRAM = cartridge.hasPRGRAM # Not reliable information on iNES ROMs (should provide mapper itself)
        @hasCHRRAM = cartridge.hasCHRRAM
        @prgROMSize = cartridge.prgROMSize or cartridge.prgROM.length
        @prgRAMSize = cartridge.prgRAMSize # Not present on iNES ROMs (should provide mapper itself)
        @chrROMSize = cartridge.chrROMSize or cartridge.chrROM.length
        @chrRAMSize = cartridge.chrRAMSize
        @prgROM = cartridge.prgROM
        @chrROM = cartridge.chrROM

    reset: ->
        # For mappers to implement.

    write: (address, value) ->
         value # Read-only by default

    ###########################################################
    # PRG ROM mapping
    ###########################################################

    mapPRGROMBank32K: (bank, address) ->
        @mapPRGROMBank8K 4 * bank, address, 4

    mapPRGROMBank16K: (bank, address) ->
        @mapPRGROMBank8K 2 * bank, address, 2

    mapPRGROMBank8K: (bank, address, count = 1) ->
        @cpuMemory.mapPRGROMBank bank + i, address + i * 0x2000 for i in [0...count]

    ###########################################################
    # PRG RAM initialization / mapping
    ###########################################################

    createPRGRAM: ->
        @prgRAM = new Array @prgRAMSize if @hasPRGRAM

    resetPRGRAM: ->
        @prgRAM[i] = 0 for i in [0...@prgRAMSize] if @hasPRGRAM

    mapPRGRAMBank8K: (bank, address) ->
        @cpuMemory.mapPRGRAMBank bank, address

    ###########################################################
    # CHR ROM mapping
    ###########################################################

    mapCHRROMBank8K: (bank, address) ->
        @mapCHRROMBank1K 8 * bank, address, 8

    mapCHRROMBank4K: (bank, address) ->
        @mapCHRROMBank1K 4 * bank, address, 4

    mapCHRROMBank2K: (bank, address) ->
        @mapCHRROMBank1K 2 * bank, address, 2

    mapCHRROMBank1K: (bank, address, count = 1) ->
        @ppuMemory.mapCHRMemoryBank bank + i, address + i * 0x0400 for i in [0...count]

    ###########################################################
    # CHR RAM initialization / mapping
    ###########################################################

    createCHRRAM: ->
        @chrRAM = new Array @chrRAMSize if @hasCHRRAM

    resetCHRRAM: ->
        @chrRAM[i] = 0 for i in [0...@chrRAMSize] if @hasCHRRAM

    mapCHRRAMBank8K: (bank, address) ->
        @mapCHRROMBank8K bank, address # PPU has identical API for both CHR ROM and CHR RAM

    mapCHRRAMBank4K: (bank, address) ->
        @mapCHRROMBank4K bank, address # PPU has identical API for both CHR ROM and CHR RAM

    ###########################################################
    # Names / attributes tables mirroring
    ###########################################################

    setMirroring: (mirroring) ->
        @ppuMemory.setNamesAttrsMirroring mirroring

module.exports = AbstractMapper
