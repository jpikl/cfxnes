AbstractLoader = require "./AbstractLoader"

class INESLoader extends AbstractLoader

    @signature: [ 0x4E, 0x45, 0x53, 0x1A ] # "NES" + character break

    @supports: (reader) ->
        @hasSignature reader, @signature

    load: (cartridge) ->
        @reset()
        @readHeader cartridge
        @readTrainer cartridge
        @readPRGROMBanks cartridge
        @readCHRROMBanks cartridge

    readHeader: (cartridge) ->
        @checkSignature INESLoader.signature
        @readPRGROMBanksCount cartridge
        @readCHRROMBanksCount cartridge
        @readControlBytes cartridge
        @readPRGRAMBanksCount cartridge
        @readFlags9 cartridge
        @readFlags10 cartridge
        @readRestOfHeader()

    readPRGROMBanksCount: (cartridge) ->
        cartridge.PRGROMBanksCount  = @readByte()

    readCHRROMBanksCount: (cartridge) ->
        cartridge.CHRROMBanksCount = @readByte() 
        cartridge.hasCHRRAM = cartridge.CHRROMBanksCount == 0

    readControlBytes: (cartridge) ->
        controlByte1 = @readByte()
        controlByte2 = @readByte()

        if @isBitSet controlByte1, 3
            cartridge.hasFourScreenVRAM = true
        else if @isBitSet controlByte1, 0
            cartridge.hasVerticalMirroring = true
        else
            cartridge.hasHorizontalMirroring = true

        cartridge.hasBattery = @isBitSet controlByte1, 1
        cartridge.hasTrainer = @isBitSet controlByte1, 2
        cartridge.hasVsUnisistem = @isBitSet controlByte2, 0
        cartridge.hasPlayChoice = @isBitSet controlByte2, 1

        mapperId = (controlByte2 & 0xF0) | (controlByte1 >> 4)
        cartridge.mapper = @createMapper mapperId
        
    readPRGRAMBanksCount: (cartridge) ->
        cartridge.PRGRAMBanksCount = Math.min 1, @readByte() # At least 1 bank always

    readFlags9: (cartridge) ->
        flags = @readByte()
        cartridge.tvSystem = if @isBitSet flags, 0 then "PAL" else "NTSC"

    readFlags10: (cartridge) ->
        flags = @readByte()
        cartridge.hasSRAM = @isBitSet flags, 4
        cartridge.hasBUSConflicts = @isBitSet flags, 5

    readRestOfHeader: ->
        @readArray 5

    readTrainer: (cartridge) ->
        cartridge.trainer = @readArray 0x200 if cartridge.hasTrainer # 512 B

    readPRGROMBanks: (cartridge) ->
        count = cartridge.PRGROMBanksCount
        cartridge.PRGROMBanks = @readArray 0x4000 for [1..count] # Each bank is 16 KB

    readCHRROMBanks: (cartridge) ->
        count = cartridge.CHRROMBanksCount
        cartridge.CHRROMBanks = @readArray 0x2000 for [1..count] # Each bank is 8 KB

    isBitSet: (value, bit) ->
        (value & (1 << bit)) != 0
