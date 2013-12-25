AbstractLoader = require "./AbstractLoader"
Util           = require "../utils/Util"

isBitSet = Util.isBitSet

INES_SIGNATURE = [ 0x4E, 0x45, 0x53, 0x1A ] # "NES^Z"

class INESLoader extends AbstractLoader

    @supportsInput: (reader) ->
        @containsSignature reader, INES_SIGNATURE

    readCartridge: ->
        @readHeader()     #  16 B [$0000-000F]
        @readTrainer()    # 512 B (optional)
        @readROMBanks()   #  16KB x number of ROM banks
        @readVROMBanks()  #   8KB x number of VROM banks

    readHeader: ->
        @checkSignature INES_SIGNATURE # 4B [$00-$03]
        @readROMBanksCount()           # 1B [$04]
        @readVROMBanksCount()          # 1B [$05]
        @readControlBytes()            # 2B [$06,$07]
        @readSRAMBanksCount()          # 1B [$08]
        @readFlags9()                  # 1B [$09]
        @readFlags10()                 # 1B [$0A]
        @readRestOfHeader()            # 5B [$0B-$0F]

    readROMBanksCount: ->
        @cartridge.ROMBanksCount  = @readByte()

    readVROMBanksCount: ->
        @cartridge.VROMBanksCount = @readByte() 
        @cartridge.hasVRAM = @cartridge.VROMBanksCount == 0

    readControlBytes: ->
        controlByte1 = @readByte()
        controlByte2 = @readByte()

        if isBitSet controlByte1, 3
            @cartridge.mirroring = "FourScreen" # TODO make enum
        else if isBitSet controlByte1, 0
            @cartridge.mirroring = "Vertical"
        else
            @cartridge.mirroring = "Horizontal"

        @cartridge.hasBattery = isBitSet controlByte1, 1
        @cartridge.hasTrainer = isBitSet controlByte1, 2
        @cartridge.hasVsUnisistem = isBitSet controlByte2, 0
        @cartridge.hasPlayChoice = isBitSet controlByte2, 1
        @cartridge.mapperId = (controlByte2 & 0xF0) | (controlByte1 >>> 4)
        
    readSRAMBanksCount: ->
        @cartridge.SRAMBanksCount = Math.min 1, @readByte() # At least 1 bank always (compatibility purposes)

    readFlags9: ->
        flags = @readByte()
        @cartridge.TVSystem = if isBitSet flags, 0 then "PAL" else "NTSC" # TODO make enum

    readFlags10: ->
        flags = @readByte()
        @cartridge.hasSRAM = isBitSet flags, 4
        @cartridge.hasBUSConflicts = isBitSet flags, 5

    readRestOfHeader: ->
        @readArray 5

    readTrainer: ->
        @cartridge.trainer = @readArray 0x200 if @cartridge.hasTrainer # 512B

    readROMBanks: ->
        @cartridge.ROMBanks = (@readROMBank() for [1..@cartridge.ROMBanksCount])

    readROMBank: ->
        @readArray 0x4000 # 16KB

    readVROMBanks: ->
        @cartridge.VROMBanks = (@readVROMBank() for [1..@cartridge.VROMBanksCount])

    readVROMBank: ->
        @readArray 0x2000 # 8KB

module.exports = INESLoader
