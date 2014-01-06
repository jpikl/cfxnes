###########################################################
# Picture processing unit
###########################################################

WIDTH = 256
HEIGHT = 240

class PPU

    @inject: [ "ppuMemory", "cpu" ]

    constructor: ->
        @framebuffer = for i in [0 ... WIDTH * HEIGHT * 4]
            if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetOAM()
        @resetRegisters()
        @resetVariables()

    resetOAM: ->
        @objectAttributeMemory = (0 for [0..0x100]) # 256B

    resetRegisters: ->
        @setControl 0       # 8-bit
        @setMask 0          # 8-bit
        @setStatus 0        # 8-bit
        @oamAddress = 0     # 16-bit
        @vramAddress = 0    # 16-bit
        @vramReadBuffer = 0 # 8-bit
        @fineXScroll = 0    # 3-bit

    resetVariables: ->
        @scanline = -1 # Total 262+1 scanlines (-1..261)
        @cycle = 0     # Total 341 cycles per scanline (0..340)

    ###########################################################
    # Control register
    ###########################################################

    writeControl: (value) ->
        @setControl value
        # Bits 0,1 (name table index) are copied to bits 10,11 of VRAM address register
        @vramAddress = (@vramAddress & 0xF3FF) | (value & 0x03) << 10
        value

    setControl: (value) ->
        @bigAddressIncrement         = (value >>> 2) & 0x01 # Bit 2
        @spritesPatternTableIndex    = (value >>> 3) & 0x01 # Bit 3
        @backgroundPatternTableIndex = (value >>> 4) & 0x01 # Bit 4
        @bigSprites                  = (value >>> 5) & 0x01 # Bit 5
        @vblankGeneratesNMI          = (value >>> 7)        # Bit 7

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
        @objectAttributeMemory[@oamAddress] = value if not @isRenderingInProgress()
        @oamAddress = (@oamAddress + 1) & 0xFF # Always increments the address
        value

    ###########################################################
    # Scrolling
    ###########################################################

    writeScroll: (value) ->
        # Uses the same register as VRAM addressing. 
        # The register has the following structure: $0yyy.NNYY.YYYX.XXXX
        #   yyy = fine Y scroll (y position of active row of rendered tile)
        #    NN = index of active name table
        # YYYYY = coarse Y scroll (y position of rendered tile in name table)
        # XXXXX = coarse X scroll (x position of rendered tile in name table)
        @writeAddress value 

    incrementFineXScroll: ->
        if @fineXScroll is 7
            @fineXScroll = 0
            @incrementCoarseXScroll()
        else
            @fineXScroll++

    incrementCoarseXScroll: ->
        if (@vramAddress & 0x001F) is 0x001F # if coarseScrollX is 31
            @vramAddress &= 0xFFE0           #     coarseScrollX = 0
            @vramAddress ^= 0x0400           #     nameTableBit0 = not nameTableBit0
        else                                 # else
            @vramAddress += 0x0001           #     coarseScrollX++

    incrementFineYScroll: ->
        if (@vramAddress & 0x7000) is 0x7000 # if fineScrollY is 7
            @vramAddress &= 0x0FFF           #     fineScrollY = 0
            @incrementCoarseYScroll()        #     incrementCoarseYScroll()
        else                                 # else
            @vramAddress += 0x1000           #     fineScrollY++

    incrementCoarseYScroll: ->
        if (@vramAddress & 0x03E0) is 0x03E0      # if coarseScrollY is 31
            @vramAddress &= 0xFC1F                #     coarseScrollY = 0
        else if (@vramAddress & 0x03E0) is 0x03A0 # else if coarseScrollY is 29
            @vramAddress &= 0xFC1F                #     coarseScrollY = 0
            @vramAddress ^= 0x0800                #     nameTableBit1 = not nameTableBit1
        else                                      # else
            @vramAddress += 0x0020                #     coarseScrollY++

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
        address = @incrementAddress()                                   # Always increments the address
        @ppuMemory.write address, value if not @isRenderingInProgress() # Only during VBLANK or disabled rendering
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
        (address & 0x3F00) == 0x3F00

    getMonochromeColorIndex: (index) ->
        index & 0x30

    ###########################################################
    # Rendering
    ###########################################################

    tick: ->
        @renderFramePixel() if @isRenderingScanlineCycle()
        @incrementCycle()

    isRenderingScanlineCycle: ->
        0 <= @scanline <= 239 and 1 <= @cycle <= 256

    renderFramePixel: ->
        @firstPixelIsRendered = @scanline is 0 and @cycle is 1
        xPosition = @cycle - 1
        yPosition = @scanline
        spriteColor = @renderSpritePixel() if @spritesVisible
        backgroundColor = @renderBackgroundPixel() if @backgroundVisible
        # TODO get RGB values of color and put them into framebuffer
        @incrementFineYScroll() if @cycle is 256
        @incrementFineXScroll()

    renderBackgroundPixel: ->
        # Optimization - we compute this only when coarse scroll X was incremented.
        if @fineXScroll is 0 or @firstPixelIsRendered
            # VRAM address register following structure: $0yyy.NNYY.YYYX.XXXX
            #   yyy = fine Y scroll (y position of active row of rendered tile)
            #    NN = index of active name table
            # YYYYY = coarse Y scroll (y position of rendered tile in name table)
            # XXXXX = coarse X scroll (x position of rendered tile in name table)
            # $2.NNYY.YYYX.XXXX is pointer into active name table,
            # where is saved currently rendered background tile (pattern number).
            patternNumberAddress = 0x2000 | (@vramAddress & 0x0FFF)
            patternNumer = @read patternNumberAddress
            # Based on control bit, we select 1 of 2 pattern tables (0x0000 or 0x1000).
            # Then we find address of pattern inside this table.
            patternTableAddress = @backgroundPatternTableIndex << 24
            patternAddress = patternTableAddress + patternNumer
            # Each pattern consists from two 8x8 bit matrixes (16B).
            # Each 8x8 matrix is a bitmap containing 1 of 2 lower color bits.
            # We read 1 bit from each bitmap on position specified by fine X,Y scroll.
            fineYScroll = (@vramAddress >>> 12) & 0x07
            colorBit1RowAddress = patternAddress + fineYScroll
            colorBit2RowAddress = colorBit1RowAddress + 0x08
            @colorBit1Row = @read colorBit1RowAddress
            @colorBit2Row = @read colorBit2RowAddress
        colorBit1 = (@colorBit1Row >>> @fineXScroll) & 0x01
        colorBit2 = ((@colorBit2Row >>> @fineXScroll) & 0x01) << 1
        # Optimization - we compute this only when coarse scroll X was incremented 4 times.
        if (@vramAddress & 0x0003) is 0 or @firstPixelIsRendered
            # We compute pointer to attribute table as $2.NN11.11YY.Y.XXX
            # where YYY and XXX are 3 upper bits of YYYYY and XXXXX.
            # Each attribute applies to area of 4x4 tiles (that's why we removed 2 lower bits of YYYYY and XXXXX).
            attributeTableAddress = 0x2000 | (@vramAddress & 0x0C00) | 0x03C0
            attributeNumber = (@vramAddress >>> 4) & 0x38 | (@vramAddress >>> 2) & 0x07
            attributeAddress = attributeTableAddress + attributeNumber
            attribute = @read attributeAddress
            # Attribute has format $3322.1100. where 00, 11, 22, 33 are two upper color bits
            # for one of 2x2 subarea of the 4x4 tile area.
            # We have to find in which subarea are we in. This is decided by bit 1 of YYYYY and XXXXX values.
            subareaNumber = (@vramAddress >>> 5) & 0x02 | (@vramAddress >>> 1) & 0x01
            @colorBits43 = ((attribute >>> subareaNumber) & 0x03) << 2
        color = @colorBits43 | colorBit2 | colorBit1
        # This 4-bit color value is actualy index to background color palette,
        # so we have to read 1 of 16 entries from that palette.
        @read 0x3F00 + color

    renderSpritePixel: ->
        color = 0 # TODO implement sprite rendering
        @read 0x3F10 + color

    incrementCycle: ->
        @cycle++
        @incementScanline() if @cycle is 341

    incementScanline: ->
        @cycle = 0
        @scanline++
        @scanline = -1 if @scanline is 262
        @vblankInProgress = 241 <= @scanline <= 260
        @cpu.nonMaskableInterrupt() if @scanline is 241 and @vblankGeneratesNMI
        @frameAvailable = true if @scanline is 241

    readFrame: ->
        @frameAvailable = false
        @framebuffer

    isFrameAvailable: ->
        @frameAvailable

    isRenderingInProgress: ->
        not @vblankInProgress and (@spritesVisible or @backgroundVisible)

module.exports = PPU
