###########################################################
# Picture processing unit
###########################################################

WIDTH  = 256
HEIGHT = 240

RGBA_COLORS = [           
    # R0    G0    B0    A0    R1    G1    B1    A1    R2    G2    B2    A2    R3    G3    B3    A3
    0x75, 0x75, 0x75, 0xFF, 0x27, 0x1B, 0x8F, 0xFF, 0x00, 0x00, 0xAB, 0xFF, 0x47, 0x00, 0x9F, 0xFF # +00
    0x8F, 0x00, 0x77, 0xFF, 0xAB, 0x00, 0x13, 0xFF, 0xA7, 0x00, 0x00, 0xFF, 0x7F, 0x0B, 0x00, 0xFF # +04
    0x43, 0x2F, 0x00, 0xFF, 0x00, 0x47, 0x00, 0xFF, 0x00, 0x51, 0x00, 0xFF, 0x00, 0x3F, 0x17, 0xFF # +08
    0x1B, 0x3F, 0x5F, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF # +0C
    0xBC, 0xBC, 0xBC, 0xFF, 0x00, 0x73, 0xEF, 0xFF, 0x23, 0x3B, 0xEF, 0xFF, 0x83, 0x00, 0xF3, 0xFF # +10
    0xBF, 0x00, 0xBF, 0xFF, 0xE7, 0x00, 0x5B, 0xFF, 0xDB, 0x2B, 0x00, 0xFF, 0xCB, 0x4F, 0x0F, 0xFF # +14
    0x8B, 0x73, 0x00, 0xFF, 0x00, 0x97, 0x00, 0xFF, 0x00, 0xAB, 0x00, 0xFF, 0x00, 0x93, 0x3B, 0xFF # +18
    0x00, 0x83, 0x8B, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF # +1C
    0xFF, 0xFF, 0xFF, 0xFF, 0x3F, 0xBF, 0xFF, 0xFF, 0x5F, 0x97, 0xFF, 0xFF, 0xA7, 0x8B, 0xFD, 0xFF # +20
    0xF7, 0x7B, 0xFF, 0xFF, 0xFF, 0x77, 0xB7, 0xFF, 0xFF, 0x77, 0x63, 0xFF, 0xFF, 0x9B, 0x3B, 0xFF # +24
    0xF3, 0xBF, 0x3F, 0xFF, 0x83, 0xD3, 0x13, 0xFF, 0x4F, 0xDF, 0x4B, 0xFF, 0x58, 0xF8, 0x98, 0xFF # +28
    0x00, 0xEB, 0xDB, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF # +2C
    0xFF, 0xFF, 0xFF, 0xFF, 0xAB, 0xE7, 0xFF, 0xFF, 0xC7, 0xD7, 0xFF, 0xFF, 0xD7, 0xCB, 0xFF, 0xFF # +30
    0xFF, 0xC7, 0xFF, 0xFF, 0xFF, 0xC7, 0xDB, 0xFF, 0xFF, 0xBF, 0xB3, 0xFF, 0xFF, 0xDB, 0xAB, 0xFF # +34
    0xFF, 0xE7, 0xA3, 0xFF, 0xE3, 0xFF, 0xA3, 0xFF, 0xAB, 0xF3, 0xBF, 0xFF, 0xB3, 0xFF, 0xCF, 0xFF # +38
    0x9F, 0xFF, 0xF3, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF # +3C
]

class PPU

    @inject: [ "ppuMemory", "cpu" ]

    constructor: ->
        @framePosition = 0
        @framebuffer = for i in [0 ... WIDTH * HEIGHT * 4]
            if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 00.00.00.FF

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetOAM()
        @resetRegisters()
        @resetVariables()

    resetOAM: ->
        @objectAttributeMemory = (0 for [0..0x100])  # 256B

    resetRegisters: ->
        @setControl 0        #  8-bit
        @setMask 0           #  8-bit
        @setStatus 0         #  8-bit
        @oamAddress = 0      # 15-bit
        @tempAddress = 0     # 15-bit also known as 'Loopy_T'
        @vramAddress = 0     # 15-bit also known as 'Loopy_V'
        @vramReadBuffer = 0  #  8-bit
        @writeToogle = 0     #  1-bit        
        @fineXScroll = 0     #  3-bit
        @tempFineXScroll = 0 #  3-bit

    resetVariables: ->
        @scanline = -1 # Total 262+1 scanlines (-1..261)
        @cycle = 0     # Total 341 cycles per scanline (0..340)
        @spriteAddresses = []
        @spriteZeroRendered = false
        @spriteInFront = false

    ###########################################################
    # Control register
    ###########################################################

    writeControl: (value) ->
        @setControl value
        @tempAddress = (@tempAddress & 0xF3FF) | (value & 0x03) << 10 # T[11,10] = C[1,0]
        value

    setControl: (value) ->
        @bigAddressIncrement         = (value >>> 2) & 0x01 # C[2]
        @spritesPatternTableIndex    = (value >>> 3) & 0x01 # C[3]
        @backgroundPatternTableIndex = (value >>> 4) & 0x01 # C[4]
        @bigSprites                  = (value >>> 5) & 0x01 # C[5]
        @vblankGeneratesNMI          = (value >>> 7)        # C[7]

    ###########################################################
    # Mask register
    ###########################################################

    writeMask: (value) ->
        @setMask value
        value

    setMask: (value) ->
        @monochromeMode            =    value        & 0x01  #  M[0]
        @spriteClipping            = !((value >>> 1) & 0x01) # !M[1]
        @backgroundClipping        = !((value >>> 2) & 0x01) # !M[2]
        @backgroundVisible         =   (value >>> 3) & 0x01  #  M[3]
        @spritesVisible            =   (value >>> 4) & 0x01  #  M[4]
        @backgroundColorsIntensity =   (value >>> 5)         #  M[7-5]

    ###########################################################
    # Status register
    ###########################################################

    readStatus: ->
        value = @getStatus()
        @vblankStarted = 0
        @writeToogle = 0
        value

    getStatus: ->
        @vramWritesIgnored     << 4 | # S[4]
        @spriteScalineOverflow << 5 | # S[5]
        @spriteZeroHit         << 6 | # S[6]
        @vblankStarted         << 7   # S[7]

    setStatus: (value) ->
        @vramWritesIgnored     = (value >>> 4) & 0x01 # S[4]
        @spriteScalineOverflow = (value >>> 5) & 0x01 # S[5]
        @spriteZeroHit         = (value >>> 6) & 0x01 # S[6]
        @vblankStarted         = (value >>> 7)        # S[7]

    ###########################################################
    # Object attribute memory access
    ###########################################################

    writeOAMAddress: (address) ->
        @oamAddress = address

    readOAMData: ->
        value = @objectAttributeMemory[@oamAddress]   # Read does not increment the address.
        value &= 0xE3 if (@oamAddress & 0x03) is 0x02 # Clear bits 2-4 when reading byte 2 of a sprite (these bits are not stored in OAM).
        value

    writeOAMData: (value) ->
        @objectAttributeMemory[@oamAddress] = value if not @isRenderingInProgress()
        @oamAddress = (@oamAddress + 1) & 0xFF # Write always increments the address.
        value

    ###########################################################
    # VRAM access
    ###########################################################

    writeAddress: (address) ->
        @writeToogle = not @writeToogle
        if @writeToogle # 1st write
            addressHigh = (address & 0x3F) << 8
            @tempAddress = (@tempAddress & 0x00FF) | addressHigh # High bits [13-8] (bit 14 is cleared)
        else            # 2nd write
            addressLow = address
            @tempAddress = (@tempAddress & 0xFF00) | addressLow  # Low bits  [7-0]
            @vramAddress = @tempAddress
        address

    readData: ->
        address = @incrementAddress()
        oldBufferContent = @vramReadBuffer
        @vramReadBuffer = @read address                                         # Always increments the address
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
        if @isPalleteAddress address
            address = 0x3F00 if @isBackdropColorAddress address
            value = @ppuMemory.read address
            value &= 0x30 if @monochromeMode
            value
        else
            @ppuMemory.read address

    write: (address, value) ->
        @ppuMemory.write address, value

    isPalleteAddress: (address) ->
        (address & 0x3F00) == 0x3F00

    isBackdropColorAddress: (address) ->
        (address & 0x0003) is 0 and not @isVBlank()

    ###########################################################
    # Scrolling
    ###########################################################

    # The position of currently rendered pattern and its pixel is stored in
    # VRAM address register with following structure: 0yyy.NNYY.YYYX.XXXX.
    #     yyy = fine Y scroll (y pixel position within pattern)
    #      NN = index of active name table (where pattern numbers are stored)
    #   YYYYY = coarse Y scroll (y position of pattern number in name table)
    #   XXXXX = coarse X scroll (x position of pattern number in name table)
    # Fine X scroll (x pixel position within pattern) has its own register.

    writeScroll: (value) ->
        @writeToogle = not @writeToogle
        if @writeToogle # 1st write (x scroll)
            @tempFineXScroll = value & 0x07
            coarseXScroll = value >>> 3
            @tempAddress = (@tempAddress & 0xFFE0) | coarseXScroll
        else            # 2nd write (y scroll)
            fineYScroll = (value & 0x07) << 12
            coarseYScroll = (value & 0xF8) << 2
            @tempAddress = (@tempAddress & 0x0C1F) | coarseYScroll | fineYScroll
        value

    copyHorizontalScrollBits: ->
        @fineXScroll = @tempFineXScroll
        @vramAddress = (@vramAddress & 0x7BE0) | (@tempAddress & 0x041F) # V[10,4-0] = T[10,4-0]

    copyVerticalScrollBits: ->
        @vramAddress = (@vramAddress & 0x041F) | (@tempAddress & 0x7BE0) # V[14-11,9-5] = T[14-11,9-5]

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
    # Rendering
    ###########################################################

    tick: ->
        @startFrame() if @isFirstRenderingCycle()
        @updateFramePixel() if @isRenderingCycle()
        @updateScrolling() if @isRenderingInProgress()
        @incrementCycle()

    isFirstRenderingCycle: ->
        @scanline is 0 and @cycle is 1

    isRenderingCycle: ->
        0 <= @scanline <= 239 and 1 <= @cycle <= 256
    
    isRenderingInProgress: ->
        not @isVBlank() and @isRenderingEnabled()

    isVBlank: ->
        241 <= @scanline <= 260

    isRenderingEnabled: ->
        @spritesVisible or @backgroundVisible

    isFrameAvailable: ->
        @frameAvailable

    startFrame: ->
        @framePosition = 0
        @fetchPattern()
        @fetchAttribute()
        @fetchPalette()

    readFrame: ->
        @frameAvailable = false
        @renderDebugFrame() if @debugMode # Rewrites the current frame.
        @framebuffer

    updateFramePixel: ->
        colorAddress = 0x3F00 | @renderFramePixel()
        @setFramePixel @read colorAddress

    setFramePixel: (color) ->
        colorPosition = color << 2 # Each RGBA color is 4B.
        @framebuffer[@framePosition++] = RGBA_COLORS[colorPosition++]
        @framebuffer[@framePosition++] = RGBA_COLORS[colorPosition++]
        @framebuffer[@framePosition++] = RGBA_COLORS[colorPosition]
        @framePosition++ # Skip alpha because it was already set to 0xFF.

    renderFramePixel: ->
        backgroundColor = @renderBackgroundPixel()
        spriteColor = @renderSpritePixel()
        if (spriteColor & 0x03) and (backgroundColor & 0x03) # Both bagckground and sprite pixels are visible
            @spriteZeroHit |= @spriteZeroRendered
            if @spriteInFront then spriteColor else backgroundColor
        else if spriteColor & 0x03 # Sprite pixel is visible
            spriteColor
        else
            backgroundColor

    updateScrolling: ->
        @incrementFineYScroll() if @cycle is 256
        @incrementFineXScroll() if 1 <= @cycle <= 256
        @copyHorizontalScrollBits() if @cycle is 257
        @copyVerticalScrollBits() if @scanline is -1 and 280 <= @cycle <= 304

    incrementCycle: ->
        @cycle++
        @incementScanline() if @cycle is 341

    incementScanline: ->
        @cycle = 0
        @scanline++
        if @scanline is 241
            @enterVBlank()
        else if @scanline is 262
            @leaveVBlank()

    enterVBlank: ->
        @vblankStarted = 1
        @frameAvailable = true
        @cpu.nonMaskableInterrupt() if @vblankGeneratesNMI

    leaveVBlank: ->
        @vblankStarted = 0
        @spriteZeroHit = 0
        @scanline = -1

    ###########################################################
    # Background rendering
    ###########################################################
    
    # Colors are saved at addresses with structure 0111.1111.000S.PPCC.
    #    S = 0 for background, 1 for sprites
    #   PP = palette number
    #   CC = color number
    #
    # The position of currently rendered pattern and its pixel is stored in
    # VRAM address register with following structure: 0yyy.NNYY.YYYX.XXXX.
    #     yyy = fine Y scroll (y pixel position within pattern)
    #      NN = index of active name table (where pattern numbers are stored)
    #   YYYYY = coarse Y scroll (y position of pattern number in name table)
    #   XXXXX = coarse X scroll (x position of pattern number in name table)
    # Fine X scroll (x pixel position within pattern) has its own register.
    # Address of a pattern number can be constructed as 0010.NNYY.YYYX.XXXX.
    #
    # Pattern number used as an offset into one of pattern tables at 
    # 0x0000 and 0x1000, where patterns are stored. We can construct 
    # this address as 00T.0000.PPPP.0000
    #      T = pattern table selection bit
    #   PPPP = pattern number
    #
    # Each pattern is 16B long and consits from two 8x8 matricies.
    # Each 8x8 matrix contains 1 bit of CC (color number) for pattern pixels.
    #
    # Palette numbers PP are defined for 2x2 tile areas. These numbers
    # are store as attributes in attribute tables. Each attribute (1B) contains
    # total 4 palette numbers for bigger 4x4 tile area as value 3322.1100
    #   00 = palette number for top left 2x2 area
    #   11 = palette number for top right 2x2 area
    #   22 = palette number for bottom left 2x2 area
    #   33 = palette number for bottom right 2x2 area
    # Address of an attribute can be constructed as 0010.NN11.11YY.YXXX
    #    YYY = 3 upper bits of YYYYY
    #    XXX = 3 upper bits of XXXXX
    # 2x2 area number can be constructed as YX
    #    Y = bit 1 of YYYYY
    #    X = bit 1 of XXXXX

    renderBackgroundPixel: ->
        @fetchPattern() if @fineXScroll is 0 # When coarse scroll X was incremented.
        return 0 if not @backgroundVisible or @cycle < 9 and @backgroundClipping
        bitNumber = @fineXScroll ^ 0x07 # 7 - fineXScroll
        colorSelect1 =  (@patternLayer1Row >>> bitNumber) & 0x01
        colorSelect2 = ((@patternLayer2Row >>> bitNumber) & 0x01) << 1
        0x3F00 | @paletteSelect | colorSelect2 | colorSelect1

    fetchPattern: ->
        @fetchPalette() if (@vramAddress & 0x0001) is 0 # When coarse scroll was incremented by 2
        patternNumer = @read 0x2000 | @vramAddress & 0x0FFF
        patternTableAddress = @backgroundPatternTableIndex << 12
        patternAddress = patternTableAddress + (patternNumer << 4)
        fineYScroll = (@vramAddress >>> 12) & 0x07
        @patternLayer1Row = @read patternAddress + fineYScroll
        @patternLayer2Row = @read patternAddress + fineYScroll + 8

    fetchPalette: ->
        @fetchAttribute() if (@vramAddress & 0x0002) is 0 # When coarse scroll was incremented by 4
        areaSelect = (@vramAddress >>> 4) & 0x04 | @vramAddress & 0x02
        @paletteSelect = ((@attribute >>> areaSelect) & 0x03) << 2

    fetchAttribute: ->
        attributeTableAddress = 0x23C0 | @vramAddress & 0x0C00
        attributeNumber = (@vramAddress >>> 4) & 0x38 | (@vramAddress >>> 2) & 0x07
        @attribute = @read attributeTableAddress + attributeNumber

    ###########################################################
    # Sprite rendering
    ###########################################################

    renderSpritePixel: ->
        # TODO rewrite and optimize this
        @fetchSprites() if @cycle is 1
        return 0 if not @spritesVisible or @cycle < 9 and @spriteClipping
        @spriteZeroRendered = false
        currentX = @cycle - 1
        currentY = @scanline - 1
        heightMask = if @bigSprites then 0x0F else 0x07
        for address in @spriteAddresses
            innerX = currentX - @objectAttributeMemory[address + 3]
            if 0 <= innerX <= 7
                innerY = currentY - @objectAttributeMemory[address]
                tile = @objectAttributeMemory[address + 1]
                attributes = @objectAttributeMemory[address + 2]
                innerX ^= 0x07 if not (attributes & 0x40)
                innerY ^= heightMask if attributes & 0x80
                patternTableIndex = if @bigSprites then tile & 0x01 else @spritesPatternTableIndex
                patternTableAddress = patternTableIndex << 12
                patternNumber = tile
                if innerY >= 8
                    patternNumber++
                    innerY -= 8
                patternAddress = patternTableAddress + (patternNumber << 4)
                patternLayer1Row = @read patternAddress + innerY
                patternLayer2Row = @read patternAddress + innerY + 8
                colorSelect1 =  (patternLayer1Row >>> innerX) & 0x01
                colorSelect2 = ((patternLayer2Row >>> innerX) & 0x01) << 1
                colorSelect = colorSelect2 | colorSelect1
                if colorSelect
                    @spriteZeroRendered ||= address is 0
                    @spriteInFront = (attributes & 0x20) is 0
                    paletteSelect = (attributes & 0x03) << 2
                    return 0x10 | paletteSelect | colorSelect
        return 0

    fetchSprites: ->
        @spriteScalineOverflow = 0
        @spriteAddresses = []
        bottomY = @scanline - 1
        topY = Math.max 0, bottomY - (if @bigSprites then 16 else 8)
        for spriteY, address in @objectAttributeMemory by 4
            if topY < spriteY <= bottomY
                @spriteAddresses.push address
                if @spriteAddresses.length >= 8
                    @spriteScalineOverflow = 1
                    return

    ###########################################################
    # Debug rendering
    ###########################################################

    setDebugMode: (enabled) ->
        @debugMode = enabled

    renderDebugFrame: ->
        @renderPatterns()
        @renderPalettes()

    renderPatterns: ->
        for tileY in [0...16]
            baseY = tileY << 3
            for tileX in [0...32]
                baseX = tileX << 3
                address = ((tileX & 0x10) << 4 | tileY << 4 | tileX & 0x0F) << 4
                @renderPatternTile baseX, baseY, address

    renderPatternTile: (baseX, baseY, address) ->
        for rowNumber in [0...8]
            y = baseY + rowNumber
            patternLayer1Row = @read address + rowNumber
            patternLayer2Row = @read address + rowNumber + 8
            for columnNumber in [0...8]
                x = baseX + columnNumber
                bitPosition = columnNumber ^ 0x07
                colorSelect1 =  (patternLayer1Row >> bitPosition) & 0x01
                colorSelect2 = ((patternLayer2Row >> bitPosition) & 0x01) << 1
                color = @read 0x3F00 | colorSelect2 | colorSelect1
                @setFramePixelOnPosition x, y, color

    renderPalettes: ->
        for tileY in [0...4]
            baseY = 128 + tileY * 28
            for tileX in [0...8]
                baseX = tileX << 5
                color = @read 0x3F00 | (tileY << 3) | tileX
                @renderPaletteTile baseX, baseY, color

    renderPaletteTile: (baseX, baseY, color) ->
        for y in [baseY ... baseY + 28]
            for x in [baseX ... baseX + 32]
                @setFramePixelOnPosition x, y, color        

    setFramePixelOnPosition: (x, y, color) ->
        colorPosition = color << 2
        framePosition = ((y << 8) + x) << 2
        @framebuffer[framePosition++] = RGBA_COLORS[colorPosition++]
        @framebuffer[framePosition++] = RGBA_COLORS[colorPosition++]
        @framebuffer[framePosition++] = RGBA_COLORS[colorPosition++]

module.exports = PPU
