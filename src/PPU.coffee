Logger = require "./utils/Logger"

logger = Logger.get()

###########################################################
# Picture processing unit
###########################################################

WIDTH  = 256
HEIGHT = 240

class PPU

    @inject: [ "ppuMemory", "cpu" ]

    ntscMode: true

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting PPU"
        @resetOAM()
        @resetRegisters()
        @resetVariables()

    resetOAM: ->
        @primaryOAM = (0 for [0..0x100])  # 256B
        @secondaryOAM = []

    resetRegisters: ->
        @setControl 0       #  8-bit
        @setMask 0          #  8-bit
        @setStatus 0        #  8-bit
        @oamAddress = 0     # 15-bit
        @tempAddress = 0    # 15-bit also known as 'Loopy_T'
        @vramAddress = 0    # 15-bit also known as 'Loopy_V'
        @vramReadBuffer = 0 #  8-bit
        @writeToogle = 0    #  1-bit
        @fineXScroll = 0    #  3-bit
        @tempXScroll = 0    #  3-bit

    resetVariables: ->
        @scanline = -1 # Total 262+1 scanlines (-1..261)
        @cycle = 0     # Total 341 cycles per scanline (0..340)
        @renderedSprite = null

    setColorPalette: (rgbData) ->
        @colorPalette = []    # Mapping of NES colors to RGBA colors
        for rgb, i in rgbData # Eeach color from input is ecoded as one number 0xRRGGBB
            colorStart = i << 2
            @colorPalette[colorStart]     = (rgb >>> 16) & 0xFF # Red
            @colorPalette[colorStart + 1] = (rgb >>>  8) & 0xFF # Green
            @colorPalette[colorStart + 2] =  rgb         & 0xFF # Blue
            @colorPalette[colorStart + 3] =  0xFF               # Alpha

    setNTSCMode: (mode) ->
        @ntscMode = mode

    ###########################################################
    # Control register
    ###########################################################

    writeControl: (value) ->
        @setControl value
        @tempAddress = (@tempAddress & 0xF3FF) | (value & 0x03) << 10 # T[11,10] = C[1,0]
        value

    setControl: (value) ->
        @bigAddressIncrement   = (value >>> 2) & 1      # C[2]
        @spPatternTableAddress = (value  << 9) & 0x1000 # C[3] -> 0x0000 / 0x1000
        @bgPatternTableAddress = (value  << 8) & 0x1000 # C[4] -> 0x0000 / 0x1000
        @bigSprites            = (value >>> 5) & 1      # C[5]
        @vblankGeneratesNMI    = (value >>> 7)          # C[7]

    ###########################################################
    # Mask register
    ###########################################################

    writeMask: (value) ->
        @setMask value
        value

    setMask: (value) ->
        @monochromeMode     =    value        & 1  #  M[0]
        @backgroundClipping = !((value >>> 1) & 1) # !M[1]
        @spriteClipping     = !((value >>> 2) & 1) # !M[2]
        @backgroundVisible  =   (value >>> 3) & 1  #  M[3]
        @spritesVisible     =   (value >>> 4) & 1  #  M[4]
        @intensifyReds      =   (value >>> 5) & 1  #  M[5]
        @intensifyGreens    =   (value >>> 6) & 1  #  M[6]
        @intensifyBlues     =   (value >>> 7)      #  M[7]

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
        @vramWritesIgnored     = (value >>> 4) & 1 # S[4]
        @spriteScalineOverflow = (value >>> 5) & 1 # S[5]
        @spriteZeroHit         = (value >>> 6) & 1 # S[6]
        @vblankStarted         = (value >>> 7)     # S[7]

    ###########################################################
    # Object attribute memory access
    ###########################################################

    writeOAMAddress: (address) ->
        @oamAddress = address

    readOAMData: ->
        value = @primaryOAM[@oamAddress]   # Read does not increment the address.
        value &= 0xE3 if (@oamAddress & 0x03) is 2 # Clear bits 2-4 when reading byte 2 of a sprite (these bits are not stored in OAM).
        value

    writeOAMData: (value) ->
        @primaryOAM[@oamAddress] = value if not @$isRenderingActive()
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
        address = @$incrementAddress()
        oldBufferContent = @vramReadBuffer
        @vramReadBuffer = @$read address                                         # Always increments the address
        if @$isPaletteAddress address then @vramReadBuffer else oldBufferContent # Delayed read outside the palette memory area

    writeData: (value) ->
        address = @$incrementAddress()                          # Always increments the address
        @$write address, value if not @$isRenderingActive() # Only during VBLANK or disabled rendering
        value

    incrementAddress: ->
        previousAddress = @vramAddress
        @vramAddress = (@vramAddress + @$getAddressIncrement()) & 0xFFFF
        previousAddress

    getAddressIncrement: ->
        if @bigAddressIncrement then 0x20 else 0x01 # Vertical/horizontal move in pattern table.


    ###########################################################
    # Internal VROM/VRAM access
    ###########################################################

    read: (address) ->
        if @$isPaletteAddress address
            value = @ppuMemory.read @$getColorAddress address
            if @monochromeMode then value & 0x30 else value
        else
            @ppuMemory.read address

    write: (address, value) ->
        @ppuMemory.write address, value

    isPaletteAddress: (address) ->
        (address & 0x3F00) == 0x3F00

    getColorAddress: (address) ->
        if @$shouldUseBackdropColor address then 0x3F00 else address

    shouldUseBackdropColor: (address) ->
        (address & 0x0003) is 0 and not @$isVBlank()

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
            @tempXScroll = value & 0x07
            coarseXScroll = value >>> 3
            @tempAddress = (@tempAddress & 0xFFE0) | coarseXScroll
        else            # 2nd write (y scroll)
            fineYScroll = (value & 0x07) << 12
            coarseYScroll = (value & 0xF8) << 2
            @tempAddress = (@tempAddress & 0x0C1F) | coarseYScroll | fineYScroll
        value

    copyHorizontalScrollBits: ->
        @fineXScroll = @tempXScroll
        @vramAddress = (@vramAddress & 0x7BE0) | (@tempAddress & 0x041F) # V[10,4-0] = T[10,4-0]

    copyVerticalScrollBits: ->
        @vramAddress = (@vramAddress & 0x041F) | (@tempAddress & 0x7BE0) # V[14-11,9-5] = T[14-11,9-5]

    incrementFineXScroll: ->
        if @fineXScroll is 7
            @fineXScroll = 0
            @$incrementCoarseXScroll()
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
        @$updateFramePixel() if @$isRenderingCycle()
        @$updateScrolling() if @$isRenderingActive()
        @$incrementCycle()

    isRenderingCycle: ->
        0 <= @scanline <= 239 and 1 <= @cycle <= 256

    isRenderingActive: ->
        not @$isVBlank() and @$isRenderingEnabled()

    isRenderingEnabled: ->
        @spritesVisible or @backgroundVisible

    isVBlank: ->
        241 <= @scanline <= 260

    isFrameAvailable: ->
        @frameAvailable

    isLightPixel: (x, y) ->
        return false if y < @scanline - 5 or y >= @scanline # Screen luminance decreases in time.
        position = (y * WIDTH + x) << 2
        @frameBuffer[position++] > 0x12 or @frameBuffer[position++] > 0x12 or @frameBuffer[position] > 0x12

    startFrame: (buffer) ->
        @framePosition = 0
        @frameBuffer = buffer
        @frameAvailable = false

    updateFramePixel: ->
        @startScanline() if @cycle is 1
        if @ntscMode and (@scanline < 8 or @scanline > 231) # Clip top/bottom 8 scanlines in NTSC
            @clearFramePixel()
        else
            colorAddress = 0x3F00 | @renderFramePixel()
            @setFramePixel @$read colorAddress

    startScanline: ->
        @fetchPattern()
        @fetchAttribute()
        @fetchPalette()
        @fetchSprites()

    renderFramePixel: ->
        backgroundColor = @renderBackgroundPixel()
        spriteColor = @renderSpritePixel()
        if (spriteColor & 0x03) and (backgroundColor & 0x03) # Both bagckground and sprite pixels are visible
            @spriteZeroHit ||= @renderedSprite.zeroSprite
            if @renderedSprite.inFront then spriteColor else backgroundColor
        else if spriteColor & 0x03 # Sprite pixel is visible
            spriteColor
        else
            backgroundColor

    clearFramePixel: ->
        @frameBuffer[@framePosition++] = 0
        @frameBuffer[@framePosition++] = 0
        @frameBuffer[@framePosition++] = 0
        @framePosition++ # Skip alpha because it was already set to 0xFF.

    setFramePixel: (color) ->
        colorPosition = color << 2 # Each RGBA color is 4B.
        @frameBuffer[@framePosition++] = @colorPalette[colorPosition++]
        @frameBuffer[@framePosition++] = @colorPalette[colorPosition++]
        @frameBuffer[@framePosition++] = @colorPalette[colorPosition]
        @framePosition++ # Skip alpha because it was already set to 0xFF.

    updateScrolling: ->
        if 1 <= @cycle <= 256
            @$incrementFineXScroll()
            @incrementFineYScroll() if @cycle is 256
        else if @cycle is 257
            @copyHorizontalScrollBits()
        else if @scanline is -1 and 280 <= @cycle <= 304
            @$copyVerticalScrollBits()

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
    # Pattern number is used as an offset into one of pattern tables at
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
        return 0 if not @backgroundVisible or @backgroundClipping and @cycle < 9
        columnNumber = @fineXScroll ^ 0x07 # 7 - fineXScroll
        colorSelect1 =  (@patternLayer1Row >>> columnNumber) & 1
        colorSelect2 = ((@patternLayer2Row >>> columnNumber) & 1) << 1
        0x3F00 | @paletteSelect | colorSelect2 | colorSelect1

    fetchPattern: ->
        @fetchPalette() if (@vramAddress & 0x0001) is 0 # When coarse scroll was incremented by 2
        patternNumer = @$read 0x2000 | @vramAddress & 0x0FFF
        patternAddress = @bgPatternTableAddress + (patternNumer << 4)
        fineYScroll = (@vramAddress >>> 12) & 0x07
        @patternLayer1Row = @$read patternAddress + fineYScroll
        @patternLayer2Row = @$read patternAddress + fineYScroll + 8

    fetchPalette: ->
        @fetchAttribute() if (@vramAddress & 0x0002) is 0 # When coarse scroll was incremented by 4
        areaSelect = (@vramAddress >>> 4) & 0x04 | @vramAddress & 0x02
        @paletteSelect = ((@attribute >>> areaSelect) & 0x03) << 2

    fetchAttribute: ->
        attributeTableAddress = 0x23C0 | @vramAddress & 0x0C00
        attributeNumber = (@vramAddress >>> 4) & 0x38 | (@vramAddress >>> 2) & 0x07
        @attribute = @$read attributeTableAddress + attributeNumber

    ###########################################################
    # Sprite rendering
    ###########################################################

    # Before each scanline, the first 8 visible sprites on that scanline are fetched into
    # secondary OAM. Each sprite has 4B of data.
    #
    # Byte 0 - y screen coordinate (decremented by 1, because rendering of fetched sprites is delayed)
    # Byte 1 - pattern number PPPP.PPPT (if 8x16 sprites are enabled, bit T selects the pattern table,
    #          otherwise it is seleted by bit 4 of control register)
    # Byte 2 - attributes VHP0.00CC
    #   V = vertical mirroring enabled
    #   H = horizontal mirroring enabled
    #   P = sprite priority (0 - in front of background, 1 - behind background)
    #   C = color palette number
    # Byte 3 = x screen coordinate

    renderSpritePixel: ->
        @renderedSprite = null
        return 0 if not @spritesVisible or @spriteClipping and @cycle < 9
        rightX = @cycle - 1
        leftX = rightX - 8
        for sprite in @secondaryOAM when leftX <= sprite.x <= rightX
            columnNumber = rightX - sprite.x
            columnNumber ^= 0x07 if not sprite.horizontalFlip
            colorSelect1 =  (sprite.patternLayer1Row >>> columnNumber) & 1
            colorSelect2 = ((sprite.patternLayer2Row >>> columnNumber) & 1) << 1
            colorSelect = colorSelect2 | colorSelect1
            if colorSelect
                @renderedSprite = sprite
                return sprite.paletteSelect | colorSelect
        return 0

    fetchSprites: ->
        @secondaryOAM = []
        @spriteScalineOverflow = 0
        spriteHeight = if @bigSprites then 16 else 8
        bottomY = @scanline - 1
        topY = Math.max 0, bottomY - spriteHeight
        for spriteY, address in @primaryOAM by 4 when topY < spriteY <= bottomY
            @fetchSprite address, spriteHeight, bottomY - spriteY
            if @secondaryOAM.length is 8
                @spriteScalineOverflow = 1
                return
        undefined

    fetchSprite: (address, height, rowNumber) ->
        patternNumber = @primaryOAM[++address]
        patternTableAddress = @spPatternTableAddress
        if @bigSprites
            patternTableAddress = (patternNumber & 1) << 12
            patternNumber &= 0xFE
        attributes = @primaryOAM[++address]
        rowNumber = height - rowNumber - 1 if attributes & 0x80 # Vertical flip
        if rowNumber >= 8
            rowNumber -= 8
            patternNumber++
        patternAddress = patternTableAddress + (patternNumber << 4)
        @secondaryOAM.push
            x:                @primaryOAM[++address]
            horizontalFlip:   attributes & 0x40
            paletteSelect:    0x10 | (attributes & 0x03) << 2
            inFront:          (attributes & 0x20) is 0
            zeroSprite:       address is 3 # 0 before multiple incrementation
            patternLayer1Row: @$read patternAddress + rowNumber
            patternLayer2Row: @$read patternAddress + rowNumber + 8

    ###########################################################
    # Debug rendering
    ###########################################################

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
        undefined

    renderPatternTile: (baseX, baseY, address) ->
        for rowNumber in [0...8]
            y = baseY + rowNumber
            patternLayer1Row = @$read address + rowNumber
            patternLayer2Row = @$read address + rowNumber + 8
            for columnNumber in [0...8]
                x = baseX + columnNumber
                bitPosition = columnNumber ^ 0x07
                colorSelect1 =  (patternLayer1Row >> bitPosition) & 0x01
                colorSelect2 = ((patternLayer2Row >> bitPosition) & 0x01) << 1
                color = @$read 0x3F00 | colorSelect2 | colorSelect1
                @setFramePixelOnPosition x, y, color
        undefined

    renderPalettes: ->
        for tileY in [0...4]
            baseY = 128 + tileY * 28
            for tileX in [0...8]
                baseX = tileX << 5
                color = @$read 0x3F00 | (tileY << 3) | tileX
                @renderPaletteTile baseX, baseY, color
        undefined

    renderPaletteTile: (baseX, baseY, color) ->
        for y in [baseY ... baseY + 28]
            for x in [baseX ... baseX + 32]
                @setFramePixelOnPosition x, y, color
        undefined

    setFramePixelOnPosition: (x, y, color) ->
        colorPosition = color << 2
        framePosition = ((y << 8) + x) << 2
        @frameBuffer[framePosition++] = @colorPalette[colorPosition++]
        @frameBuffer[framePosition++] = @colorPalette[colorPosition++]
        @frameBuffer[framePosition++] = @colorPalette[colorPosition++]

module.exports = PPU
