AbstractLoader = require "./AbstractLoader"

INES_SIGNATURE = [ 0x4E, 0x45, 0x53, 0x1A ] # "NES^Z"

class INESLoader extends AbstractLoader

    @supportsInput: (reader) ->
        @containsSignature reader, INES_SIGNATURE

    readCartridge: ->
        @readHeader()
        @readTrainer()
        @readROMBanks()
        @readVROMBanks()

    readHeader: ->
        @checkSignature INES_SIGNATURE
        @readROMBanksCount()
        @readVROMBanksCount()
        @readControlBytes()
        @readRAMBanksCount()
        @readFlags9()
        @readFlags10()
        @readRestOfHeader()

    readROMBanksCount: ->
        @cartridge.ROMBanksCount  = @readByte()

    readVROMBanksCount: ->
        @cartridge.VROMBanksCount = @readByte() 
        @cartridge.hasVRAM = @cartridge.VROMBanksCount == 0

    readControlBytes: ->
        controlByte1 = @readByte()
        controlByte2 = @readByte()

        if @isBitSet controlByte1, 3
            @cartridge.hasFourScreenVRAM = true
        else if @isBitSet controlByte1, 0
            @cartridge.hasVerticalMirroring = true
        else
            @cartridge.hasHorizontalMirroring = true

        @cartridge.hasBattery = @isBitSet controlByte1, 1
        @cartridge.hasTrainer = @isBitSet controlByte1, 2
        @cartridge.hasVsUnisistem = @isBitSet controlByte2, 0
        @cartridge.hasPlayChoice = @isBitSet controlByte2, 1
        @cartridge.mapperId = (controlByte2 & 0xF0) | (controlByte1 >> 4)
        
    readRAMBanksCount: ->
        @cartridge.RAMBanksCount = Math.min 1, @readByte() # At least 1 bank always

    readFlags9: ->
        flags = @readByte()
        @cartridge.tvSystem = if @isBitSet flags, 0 then "PAL" else "NTSC"

    readFlags10: ->
        flags = @readByte()
        @cartridge.hasSRAM = @isBitSet flags, 4
        @cartridge.hasBUSConflicts = @isBitSet flags, 5

    readRestOfHeader: ->
        @readArray 5

    readTrainer: ->
        @cartridge.trainer = @readArray 0x200 if @cartridge.hasTrainer # 512 B

    readROMBanks: ->
        count = @cartridge.ROMBanksCount
        @cartridge.ROMBanks = @readArray 0x4000 for [1..count] # Each bank is 16 KB

    readVROMBanks: ->
        count = @cartridge.VROMBanksCount
        @cartridge.VROMBanks = @readArray 0x2000 for [1..count] # Each bank is 8 KB

module.exports = INESLoader
