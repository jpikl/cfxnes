###########################################################
# Picture processing unit
###########################################################

class PPU

    @inject: [ "ppuMemory", "cpu" ]

    constructor: ->
        @initSpriteRAM()
        @resetRegisters()

    ###########################################################
    # Initialization
    ###########################################################

    initSpriteRAM: ->
        @spriteRAM = (0 for [0..0x100]) # 256B

    resetRegisters: ->
        @setControlRegister1 0xA0 
        @setControlRegister2 0x1E
        @setStatusRegister 0x00
        @spriteRAMAddressRegister = 0
        @vramAddressRegister1 = 0
        @vramAddressRegister2 = 0

    ###########################################################
    # Registers reading / writing
    ###########################################################

    getControlRegister1: ->
        @nameTableIndex                      | # Bits 0,1
        @bigAddressIncrement            << 2 | # Bit  2
        @spritesPatternTablePosition    << 3 | # Bit  3
        @backgroundPatternTablePosition << 4 | # Bit  4
        @bigSprites                     << 5 | # Bit  5
        @vblankGeneratesNMI             << 7   # Bit  7

    setControlRegister1: (value) ->
        @nameTableIndex                 =  value        & 0x03 # Bits 0,1
        @bigAddressIncrement            = (value >>> 2) & 0x01 # Bit  2
        @spritesPatternTablePosition    = (value >>> 3) & 0x01 # Bit  3
        @backgroundPatternTablePosition = (value >>> 4) & 0x01 # Bit  4
        @bigSprites                     = (value >>> 5) & 0x01 # Bit  5
        @vblankGeneratesNMI             = (value >>> 7)        # Bit  7

    getControlRegister2: ->
        @monochromeMode                 | # Bit  0
        @noSpriteClipping          << 1 | # Bit  1
        @noBackgroundClipping      << 2 | # Bit  2
        @backgroundVisible         << 3 | # Bit  3
        @spritesVisible            << 4 | # Bit  4
        @monochromeBackgroundColor << 5   # Bits 5-7

    setControlRegister2: (value) ->
        @monochromeMode            =  value        & 0x01  # Bit  0
        @noSpriteClipping          = (value >>> 1) & 0x01  # Bit  1
        @noBackgroundClipping      = (value >>> 2) & 0x01  # Bit  2
        @backgroundVisible         = (value >>> 3) & 0x01  # Bit  3
        @spritesVisible            = (value >>> 4) & 0x01  # Bit  4
        @monochromeBackgroundColor = (value >>> 5)         # Bits 5-7

    getStatusRegister: ->
        @vramWritesIgnored         << 4 | # Bit 4
        @spriteScalineLimitReached << 5 | # Bit 5
        @spriteZeroHitFlag         << 6 | # Bit 6
        @vblankInProgress          << 7   # Bit 7

    setStatusRegister: (value) ->
        @vramWritesIgnored         = (value >>> 4) & 0x01 # Bit 4
        @spriteScalineLimitReached = (value >>> 5) & 0x01 # Bit 5
        @spriteZeroHitFlag         = (value >>> 6) & 0x01 # Bit 6
        @vblankInProgress          = (value >>> 7)        # Bit 7

    ###########################################################
    # Rendering
    ###########################################################

    tick: ->

module.exports = PPU
