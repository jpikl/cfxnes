###########################################################
# Picture processing unit
###########################################################

class PPU

    @inject: [ "ppuMemory", "cpu" ]

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetOAM()
        @resetRegisters()

    resetOAM: ->
        @objectAttributeMemory = (0 for [0..0x100]) # 256B

    resetRegisters: ->
        @setControl 0
        @setMask 0
        @setStatus 0
        @oamAddress = 0
        @vramAddress = 0
        @vramReadBuffer = 0

    ###########################################################
    # Control register
    ###########################################################

    writeControl: (value) ->
        @setControl value
        value

    setControl: (value) ->
        @baseNameTableIndex          =  value        & 0x03 # Bits 0,1
        @bigAddressIncrement         = (value >>> 2) & 0x01 # Bit  2
        @spritesPatternTableIndex    = (value >>> 3) & 0x01 # Bit  3
        @backgroundPatternTableIndex = (value >>> 4) & 0x01 # Bit  4
        @bigSprites                  = (value >>> 5) & 0x01 # Bit  5
        @vblankGeneratesNMI          = (value >>> 7)        # Bit  7

    ###########################################################
    # Mask register
    ###########################################################

    writeMask: (value) ->
        @setMask value
        value

    setMask: (value) ->
        @monochromeMode            =  value        & 0x01  # Bit  0
        @noSpriteClipping          = (value >>> 1) & 0x01  # Bit  1
        @noBackgroundClipping      = (value >>> 2) & 0x01  # Bit  2
        @backgroundVisible         = (value >>> 3) & 0x01  # Bit  3
        @spritesVisible            = (value >>> 4) & 0x01  # Bit  4
        @backgroundColorsIntensity = (value >>> 5)         # Bits 5-7

    ###########################################################
    # Status register
    ###########################################################

    readStatus: ->
        value = @getStatus()
        @clearFlagsAffectedByStatus()
        value

    clearFlagsAffectedByStatus: ->
        @vblankInProgress = 0
        @vramAddress = 0

    getStatus: ->
        @vramWritesIgnored     << 4 | # Bit 4
        @spriteScalineOverflow << 5 | # Bit 5
        @spriteZeroHit         << 6 | # Bit 6
        @vblankInProgress      << 7   # Bit 7

    setStatus: (value) ->
        @vramWritesIgnored         = (value >>> 4) & 0x01 # Bit 4
        @spriteScalineOverflow     = (value >>> 5) & 0x01 # Bit 5
        @spriteZeroHit             = (value >>> 6) & 0x01 # Bit 6
        @vblankInProgress          = (value >>> 7)        # Bit 7

    ###########################################################
    # Object attribute memory access
    ###########################################################

    writeOAMAddress: (address) ->
        @oamAddress = address

    readOAMData: ->
        @objectAttributeMemory[@oamAddress] # Does not increment the address

    writeOAMData: (value) ->
        @objectAttributeMemory[@oamAddress] = value if not @renderingInProgress()
        @oamAddress = (@oamAddress + 1) & 0xFF # Always increments the address
        value

    ###########################################################
    # Scrolling
    ###########################################################

    writeScroll: (value) ->
        @writeAddress value # Uses the same register as VRAM addressing

    ###########################################################
    # VRAM access
    ###########################################################

    writeAddress: (address) ->
        @vramAddress = (@vramAddress << 8 | address) & 0xFFFF
        address

    readData: ->
        oldBufferContent = @vramReadBuffer
        @vramReadBuffer = @read @incrementAddress()                             # Always increments the address
        if @isPalleteAddress address then @vramReadBuffer else oldBufferContent # Delayed read outside the pallete memory area

    writeData: (value) ->
        address = @incrementAddress()                                 # Always increments the address
        @ppuMemory.write address, value if not @renderingInProgress() # Only during VBLANK or disabled rendering
        value

    incrementAddress: ->
        previousAddress = @vramAddress
        @vramAddress = (@vramAddress + @getAddressIncrement()) & 0xFFFF
        previousAddress

    getAddressIncrement: ->
        if @bigAddressIncrement then 0x20 else 0x01


    ###########################################################
    # Internal VRAM access
    ###########################################################

    read: (address) ->
        value = @ppuMemory.read address
        if @isPalleteAddress address and @monochromeMode
            @getMonochromeColorIndex value
        else
            value

    write: (address, value) ->
        @ppuMemory.write address, value

    isPalleteAddress: (address) ->
        address & 0x3F00

    ###########################################################
    # Rendering
    ###########################################################

    getMonochromeColorIndex: (index) ->
        index & 0x30

    renderingInProgress: ->
        not @vblankInProgress and (@spritesVisible or @backgroundVisible)

    tick: ->

module.exports = PPU
