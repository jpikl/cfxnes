Interrupt = require("../common/types").Interrupt
logger    = require("../utils/logger").get()

# Frame size
FRAME_BUFFER_WIDTH  = require("../common/constants").VIDEO_WIDTH
FRAME_BUFFER_HEIGHT = require("../common/constants").VIDEO_HEIGHT

# Cycle/scanlines flags
F_RENDER    = 1 <<  0 # Rendering cycle
F_FETCH_BG  = 1 <<  1 # Cycle where background data are fetched
F_FETCH_SP  = 1 <<  2 # Cycle where sprite data are fetched
F_SHIFT_BG  = 1 <<  3 # Cycle where background buffers are shifted
F_CLIP_LEFT = 1 <<  4 # Cycle where 8 left pixels are clipped
F_CLIP_NTSC = 1 <<  5 # Cycle where 8 top/bottom pixels are clipped
F_INC_CX    = 1 <<  6 # Cycle where coarse X scroll is incremented
F_INC_FY    = 1 <<  7 # Cycle where fine Y scroll is incremented
F_COPY_HS   = 1 <<  8 # Cycle where horizontal scroll bits are copied
F_COPY_VS   = 1 <<  9 # Cycle where vertical scroll bits are copied
F_VB_START  = 1 << 10 # Cycle where VBlank starts
F_VB_START2 = 1 << 13 # Cycle where VBlank starts and the 2 following cycles
F_VB_END    = 1 << 12 # Cycle where VBlank ends

# Tables containing flags for all cycles/scanlines
cycleFlagsTable = (0 for [0..340])
scanlineFlagsTable = (0 for [-1..261])

cycleFlagsTable[i]    |= F_RENDER for i in [1..256]
scanlineFlagsTable[i] |= F_RENDER for i in [0..239]

cycleFlagsTable[i]    |= F_FETCH_BG for i in [8..336] when not (i & 0x7) and not (256 < i < 328)
scanlineFlagsTable[i] |= F_FETCH_BG for i in [0..239]

cycleFlagsTable[1]    |= F_FETCH_SP
scanlineFlagsTable[i] |= F_FETCH_SP for i in [0..239]

cycleFlagsTable[i]    |= F_SHIFT_BG for i in [1..336] when not (256 < i < 321)
scanlineFlagsTable[i] |= F_SHIFT_BG for i in [0..239]

cycleFlagsTable[i]    |= F_CLIP_LEFT for i in [1..8]
scanlineFlagsTable[i] |= F_CLIP_LEFT for i in [0..239]

cycleFlagsTable[i]    |= F_CLIP_NTSC for i in [1..256]
scanlineFlagsTable[i] |= F_CLIP_NTSC for i in [0..239] when not (7 < i < 232)

cycleFlagsTable[i]    |= F_INC_CX for i in [8..336] when not (i & 0x7) and not (256 < i < 328)
scanlineFlagsTable[i] |= F_INC_CX for i in [0..261] when not (239 < i < 261)

cycleFlagsTable[256]  |= F_INC_FY
scanlineFlagsTable[i] |= F_INC_FY for i in [0..261] when not (239 < i < 261)

cycleFlagsTable[257]  |= F_COPY_HS
scanlineFlagsTable[i] |= F_COPY_HS for i in [0..261] when not (239 < i < 261)

cycleFlagsTable[i]      |= F_COPY_VS for i in [280..304]
scanlineFlagsTable[261] |= F_COPY_VS

cycleFlagsTable[1]      |= F_VB_START
scanlineFlagsTable[241] |= F_VB_START

cycleFlagsTable[i]      |= F_VB_START2 for i in [1..3]
scanlineFlagsTable[241] |= F_VB_START2

cycleFlagsTable[1]      |= F_VB_END
scanlineFlagsTable[261] |= F_VB_END

###########################################################
# Picture processing unit
###########################################################

class PPU

    @dependencies: [ "ppuMemory", "cpu" ]

    init: (ppuMemory, cpu) ->
        @ppuMemory = ppuMemory
        @cpu = cpu
        @ntscMode = true
        @colorEmphasis = 0

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
        @setControl 0       #  8-bit PPUCTRL register
        @setMask 0          #  8-bit PPUMASK register
        @setStatus 0        #  8-bit PPUSTATUS register
        @oamAddress = 0     # 15-bit OAMADDR register
        @tempAddress = 0    # 15-bit 'Loopy T' register
        @vramAddress = 0    # 15-bit 'Loopy V' register
        @vramReadBuffer = 0 #  8-bit VRAM read buffer
        @writeToogle = 0    #  1-bit 'Loopy W' register
        @fineXScroll = 0    #  3-bit 'Loopy X' register
        @patternBuffer0 = 0 # 16-bit pattern (bit 0) shift buffer
        @patternBuffer1 = 0 # 16-bit pattern (bit 1) shift buffer
        @paletteBuffer0 = 0 #  8-bit palette (bit 0) shift buffer
        @paletteBuffer1 = 0 #  8-bit palette (bit 1) shift buffer
        @paletteLatch0 = 0  #  1-bit palette (bit 0) latch register
        @paletteLatch1 = 0  #  1-bit palette (bit 1) latch register

    resetVariables: ->
        @scanline = -1          # Total 262 scanlines (0..261)
        @cycle = 0              # Total 341 cycles per scanline (0..340)
        @cycleFlags = 0         # Flags for current cycle
        @renderedSprite = null  # Currently rendered sprite
        @suppressVBlank = false # Whether to suppress VBlank flag setting
        @supressNMI = false     # Whether to supress NMI generation
        @nmiDelay = 0           # Number of cycles after which NMI is generated
        @oddFrame = false       # Whether odd frame is being rendered

    ###########################################################
    # External configuration
    ###########################################################

    setNTSCMode: (ntscMode) ->
        @ntscMode = ntscMode

    setRGBAPalette: (rgbData) ->
        @createRGBAPalettes rgbData
        @updateRGBAPalette()

    ###########################################################
    # Palette generation
    ###########################################################

    createRGBAPalettes: (rgbData) ->
        # Emphasis bits: BGR
        @rgbaPalettes = for colorEmphasis in [0..7]
            rRatio = if colorEmphasis & 6 then 0.75 else 1.0 # Dim red when green or blue is emphasized
            gRatio = if colorEmphasis & 5 then 0.75 else 1.0 # Dim green when red or blue is emphasized
            bRatio = if colorEmphasis & 3 then 0.75 else 1.0 # Dim blue when red or green is emphasized
            @createRGBAPalette rgbData, rRatio, gRatio, bRatio

    createRGBAPalette: (rgbData, rRatio, gRatio, bRatio) ->
        palette = []          # Mapping of NES colors to RGBA colors
        for rgb, i in rgbData # Eeach color from input is ecoded as one number 0xRRGGBB
            colorStart = i << 2
            palette[colorStart]     = Math.floor rRatio * ((rgb >>> 16) & 0xFF) # Red
            palette[colorStart + 1] = Math.floor gRatio * ((rgb >>>  8) & 0xFF) # Green
            palette[colorStart + 2] = Math.floor bRatio * ( rgb         & 0xFF) # Blue
            palette[colorStart + 3] = 0xFF                                      # Alpha
        palette

    updateRGBAPalette: ->
        @rgbaPalette = @rgbaPalettes[@colorEmphasis]

    ###########################################################
    # Control register ($2000)
    ###########################################################

    writeControl: (value) ->
        nmiEnabledOld = @nmiEnabled
        @setControl value
        @tempAddress = (@tempAddress & 0xF3FF) | (value & 0x03) << 10 # T[11,10] = C[1,0]
        if @vblankFlag and not nmiEnabledOld and @nmiEnabled and not (@cycleFlags & F_VB_END)
            @nmiDelay = 1  # Generate NMI after next instruction when its enabled (from 0 to 1) during VBlank
        value

    setControl: (value) ->
        @bigAddressIncrement   = (value >>> 2) & 1      # C[2] VRAM address increment per CPU read/write of PPUDATA (1 / 32)
        @spPatternTableAddress = (value  << 9) & 0x1000 # C[3] Sprite pattern table address for 8x8 sprites ($0000 / $1000)
        @bgPatternTableAddress = (value  << 8) & 0x1000 # C[4] Background pattern table address-($0000 / $1000)
        @bigSprites            = (value >>> 5) & 1      # C[5] Sprite size (8x8 / 8x16)
        @nmiEnabled            = (value >>> 7)          # C[7] Whether NMI is generated at the start of the VBlank

    ###########################################################
    # Mask register ($2001)
    ###########################################################

    writeMask: (value) ->
        @setMask value
        @updateRGBAPalette()
        value

    setMask: (value) ->
        @monochromeMode     =    value        & 1  #  M[0]   Color / monochrome mode switch
        @backgroundClipping = !((value >>> 1) & 1) # !M[1]   Whether to show background in leftmost 8 pixels of screen
        @spriteClipping     = !((value >>> 2) & 1) # !M[2]   Whether to show sprites in leftmost 8 pixels of screen
        @backgroundVisible  =   (value >>> 3) & 1  #  M[3]   Wheter background is visible
        @spritesVisible     =   (value >>> 4) & 1  #  M[4]   Wheter sprites are visible
        @colorEmphasis      =   (value >>> 5) & 7  #  M[5-7] Color palette BGR emphasis bits

    ###########################################################
    # Status register ($2002)
    ###########################################################

    readStatus: ->
        value = @getStatus()
        @vblankFlag = 0     # Cleared by reading status
        @writeToogle = 0    # Cleared by reading status
        @suppressVBlank = true if @cycleFlags & F_VB_START  # Reading just before VBlank disables VBlank flag setting
        @supressNMI = true     if @cycleFlags & F_VB_START2 # Reading just before VBlank and 2 cycles after VBlank disables NMI generation
        value

    getStatus: ->
        @spriteScalineOverflow << 5 | # S[5] Set when there is more than 8 sprites on current scanline
        @spriteZeroHit         << 6 | # S[6] Set when a nonzero pixel of sprite 0 overlaps a nonzero background pixel
        @vblankFlag            << 7   # S[7] Set at the start of the VBlank

    setStatus: (value) ->
        @spriteScalineOverflow = (value >>> 5) & 1 # S[5]
        @spriteZeroHit         = (value >>> 6) & 1 # S[6]
        @vblankFlag            = (value >>> 7)     # S[7]

    ###########################################################
    # OAM access ($2003 - address / $2004 - data)
    ###########################################################

    writeOAMAddress: (address) ->
        @oamAddress = address

    readOAMData: ->
        value = @primaryOAM[@oamAddress]           # Read does not increment the address.
        value &= 0xE3 if (@oamAddress & 0x03) is 2 # Clear bits 2-4 when reading byte 2 of a sprite (these bits are not stored in OAM).
        value

    writeOAMData: (value) ->
        @primaryOAM[@oamAddress] = value unless @$isRenderingActive()
        @oamAddress = (@oamAddress + 1) & 0xFF # Write always increments the address.
        value

    ###########################################################
    # VRAM access ($2006 - address / $2007 - data)
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
        address = @$incrementAddress()                      # Always increments the address
        @$write address, value unless @$isRenderingActive() # Only during VBlank or disabled rendering
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
            @readPalette address
        else
            @ppuMemory.read address

    readPalette: (address) ->
        value = @ppuMemory.read @$fixColorAddress address
        if @monochromeMode then value & 0x30 else value

    isPaletteAddress: (address) ->
        (address & 0x3F00) == 0x3F00

    fixColorAddress: (address) ->
        if @$shouldUseBackdropColor address then 0x3F00 else address

    shouldUseBackdropColor: (address) ->
        (address & 0x0003) is 0 and not @vblankActive

    write: (address, value) ->
        @ppuMemory.write address, value

    ###########################################################
    # Scrolling and scrolling register ($2005)
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
        if @writeToogle # 1st write (X scroll)
            @fineXScroll = value & 0x07
            coarseXScroll = value >>> 3
            @tempAddress = (@tempAddress & 0xFFE0) | coarseXScroll
        else            # 2nd write (Y scroll)
            fineYScroll = (value & 0x07) << 12
            coarseYScroll = (value & 0xF8) << 2
            @tempAddress = (@tempAddress & 0x0C1F) | coarseYScroll | fineYScroll
        value

    updateScrolling: ->
        @$incrementCoarseXScroll()   if @cycleFlags & F_INC_CX
        @$incrementFineYScroll()     if @cycleFlags & F_INC_FY
        @$copyHorizontalScrollBits() if @cycleFlags & F_COPY_HS
        @$copyVerticalScrollBits()   if @cycleFlags & F_COPY_VS

    copyHorizontalScrollBits: ->
        @vramAddress = (@vramAddress & 0x7BE0) | (@tempAddress & 0x041F) # V[10,4-0] = T[10,4-0]

    copyVerticalScrollBits: ->
        @vramAddress = (@vramAddress & 0x041F) | (@tempAddress & 0x7BE0) # V[14-11,9-5] = T[14-11,9-5]

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
    # Frame buffer access
    ###########################################################

    startFrame: (buffer) ->
        @framePosition = 0
        @frameBuffer = buffer
        @frameAvailable = false

    isFrameAvailable: ->
        @frameAvailable

    isBrightFramePixel: (x, y) ->
        return false if y < @scanline - 5 or y >= @scanline # Screen luminance decreases in time
        position = (y * FRAME_BUFFER_WIDTH + x) << 2
        @frameBuffer[position++] > 0x12 or @frameBuffer[position++] > 0x12 or @frameBuffer[position] > 0x12

    setFramePixel: (color) ->
        colorPosition = color << 2 # Each RGBA color is 4B.
        @frameBuffer[@framePosition++] = @rgbaPalette[colorPosition++]
        @frameBuffer[@framePosition++] = @rgbaPalette[colorPosition++]
        @frameBuffer[@framePosition++] = @rgbaPalette[colorPosition]
        @framePosition++ # Skip alpha because it was already set to 0xFF

    clearFramePixel: ->
        @frameBuffer[@framePosition++] = 0
        @frameBuffer[@framePosition++] = 0
        @frameBuffer[@framePosition++] = 0
        @framePosition++ # Skip alpha because it was already set to 0xFF

    ###########################################################
    # VBlank detection / NMI generation
    ###########################################################

    updateVBlank: ->
        if @nmiDelay and not --@nmiDelay and @nmiEnabled and not @supressNMI
            @cpu.activateInterrupt Interrupt.NMI
        if @cycleFlags & F_VB_START
            @$enterVBlank()
        else if @cycleFlags & F_VB_END
            @$leaveVBlank()

    enterVBlank: ->
        @vblankActive = 1
        @vblankFlag = 1 unless @suppressVBlank
        @nmiDelay = 2
        @frameAvailable = true

    leaveVBlank: ->
        @vblankActive = 0
        @vblankFlag = 0
        @suppressVBlank = false
        @supressNMI = false
        @spriteZeroHit = 0

    ###########################################################
    # Scanline / cycle counters
    ###########################################################

    incrementCycle: ->
        @cycle++
        @incementScanline() if @cycle > 340
        @cycleFlags = cycleFlagsTable[@cycle] & scanlineFlagsTable[@scanline] # Update flags for new scanline/cycle

    incementScanline: ->
        @cycle = 0
        @scanline++
        @incrementFrame() if @scanline > 261

    incrementFrame: ->
        @scanline = 0
        @cycle++ if @oddFrame and @$isRenderingEnabled()
        @oddFrame = not @oddFrame

    ###########################################################
    # Rendering
    ###########################################################

    tick: ->
        @$fetchBackgroundData()    if @cycleFlags & F_FETCH_BG
        @$fetchSpriteData()        if @cycleFlags & F_FETCH_SP
        @$updateFramePixel()       if @cycleFlags & F_RENDER
        @$shiftBackgroundBuffers() if @cycleFlags & F_SHIFT_BG
        @$updateScrolling()        if @$isRenderingEnabled()
        @$updateVBlank()
        @$incrementCycle()

    isRenderingActive: ->
        not @vblankActive and @$isRenderingEnabled()

    isRenderingEnabled: ->
        @spritesVisible or @backgroundVisible

    updateFramePixel: ->
        if @ntscMode and @cycleFlags & F_CLIP_NTSC # Clip top/bottom 8 scanlines in NTSC
            @clearFramePixel()
        else
            colorAddress = 0x3F00 | @renderFramePixel()
            @setFramePixel @$readPalette colorAddress

    renderFramePixel: ->
        @renderedSprite = null
        backgroundColor = @renderBackgroundPixel()
        spriteColor = @renderSpritePixel()
        if (spriteColor & 0x03) and (backgroundColor & 0x03)
            @spriteZeroHit ||= @renderedSprite.zeroSprite                    # Both bagckground and sprite pixels are visible
            if @renderedSprite.inFront then spriteColor else backgroundColor # Choose target by rendering priority
        else if spriteColor & 0x03
            spriteColor      # Sprite pixel is visible
        else
            backgroundColor  # Otherwise render backround

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
        return 0 if @$isBackgroundPixelInvisible()
        colorBit0   = ((@patternBuffer0 << @fineXScroll) >> 15) & 0x1
        colorBit1   = ((@patternBuffer1 << @fineXScroll) >> 14) & 0x2
        paletteBit0 = ((@paletteBuffer0 << @fineXScroll) >>  5) & 0x4
        paletteBit1 = ((@paletteBuffer1 << @fineXScroll) >>  4) & 0x8
        return paletteBit1 | paletteBit0 | colorBit1 | colorBit0

    isBackgroundPixelInvisible: ->
        not @backgroundVisible or @backgroundClipping and (@cycleFlags & F_CLIP_LEFT)

    fetchBackgroundData: ->
        @$fetchPalette()
        @$fetchPattern()

    fetchPalette: ->
        attributeTableAddress = 0x23C0 | @vramAddress & 0x0C00
        attributeNumber = (@vramAddress >>> 4) & 0x38 | (@vramAddress >>> 2) & 0x07
        attribute = @ppuMemory.read attributeTableAddress + attributeNumber
        areaNumber = (@vramAddress >>> 4) & 0x04 | @vramAddress & 0x02
        paletteNumber = (attribute >>> areaNumber) & 0x03
        @paletteLatch0 = paletteNumber & 1
        @paletteLatch1 = (paletteNumber >>> 1) & 1

    fetchPattern: ->
        patternNumer = @ppuMemory.read 0x2000 | @vramAddress & 0x0FFF
        patternAddress = @bgPatternTableAddress + (patternNumer << 4)
        fineYScroll = (@vramAddress >>> 12) & 0x07
        @patternBuffer0 |= @ppuMemory.read patternAddress + fineYScroll
        @patternBuffer1 |= @ppuMemory.read patternAddress + fineYScroll + 8

    shiftBackgroundBuffers: ->
        @patternBuffer0 = (@patternBuffer0 << 1)
        @patternBuffer1 = (@patternBuffer1 << 1)
        @paletteBuffer0 = (@paletteBuffer0 << 1) | @paletteLatch0
        @paletteBuffer1 = (@paletteBuffer1 << 1) | @paletteLatch1

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
        return 0 if @$isSpritePixelInvisible()
        rightX = @cycle - 1
        leftX = rightX - 8
        for sprite in @secondaryOAM when leftX <= sprite.x <= rightX
            columnNumber = rightX - sprite.x
            columnNumber ^= 0x07 if not sprite.horizontalFlip
            colorBit0 = ((sprite.patternRow0 >>> columnNumber) & 1)
            colorBit1 = ((sprite.patternRow1 >>> columnNumber) & 1) << 1
            colorNumber = colorBit1 | colorBit0
            if colorNumber
                @renderedSprite = sprite
                return sprite.paletteNumber | colorNumber
        return 0

    isSpritePixelInvisible: ->
        not @spritesVisible or @spriteClipping and (@cycleFlags & F_CLIP_LEFT)

    fetchSpriteData: ->
        @secondaryOAM = []
        @spriteScalineOverflow = 0
        spriteHeight = if @bigSprites then 16 else 8
        bottomY = @scanline - 1
        topY = Math.max 0, bottomY - spriteHeight
        for spriteY, address in @primaryOAM by 4 when topY < spriteY <= bottomY
            @fetchSprite address, spriteHeight, bottomY - spriteY
            if @secondaryOAM.length is 8
                @spriteScalineOverflow = 1
                break
        undefined

    fetchSprite: (address, height, rowNumber) ->
        patternNumber = @primaryOAM[address + 1]
        patternTableAddress = @spPatternTableAddress
        if @bigSprites
            patternTableAddress = (patternNumber & 1) << 12
            patternNumber &= 0xFE
        attributes = @primaryOAM[address + 2]
        rowNumber = height - rowNumber - 1 if attributes & 0x80 # Vertical flip
        if rowNumber >= 8
            rowNumber -= 8
            patternNumber++
        patternAddress = patternTableAddress + (patternNumber << 4)
        @secondaryOAM.push
            x:              @primaryOAM[address + 3]
            horizontalFlip: attributes & 0x40
            paletteNumber:  0x10 | (attributes & 0x03) << 2
            inFront:        (attributes & 0x20) is 0
            zeroSprite:     address is 0
            patternRow0:    @ppuMemory.read patternAddress + rowNumber
            patternRow1:    @ppuMemory.read patternAddress + rowNumber + 8

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
            patternBuffer0 = @ppuMemory.read address + rowNumber
            patternBuffer1 = @ppuMemory.read address + rowNumber + 8
            for columnNumber in [0...8]
                x = baseX + columnNumber
                bitPosition = columnNumber ^ 0x07
                colorSelect1 =  (patternBuffer0 >> bitPosition) & 0x01
                colorSelect2 = ((patternBuffer1 >> bitPosition) & 0x01) << 1
                color = @$readPalette 0x3F00 | colorSelect2 | colorSelect1
                @setFramePixelOnPosition x, y, color
        undefined

    renderPalettes: ->
        for tileY in [0...4]
            baseY = 128 + tileY * 28
            for tileX in [0...8]
                baseX = tileX << 5
                color = @$readPalette 0x3F00 | (tileY << 3) | tileX
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
        @frameBuffer[framePosition++] = @rgbaPalette[colorPosition++]
        @frameBuffer[framePosition++] = @rgbaPalette[colorPosition++]
        @frameBuffer[framePosition++] = @rgbaPalette[colorPosition++]

module.exports = PPU
