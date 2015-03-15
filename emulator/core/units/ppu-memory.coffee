Mirroring = require("../common/types").Mirroring
logger    = require("../utils/logger").get()
system    = require "../utils/system"

POWER_UP_PALETTES = [
    0x09, 0x01, 0x00, 0x01, 0x00, 0x02, 0x02, 0x0D
    0x08, 0x10, 0x08, 0x24, 0x00, 0x00, 0x04, 0x2C
    0x09, 0x01, 0x34, 0x03, 0x00, 0x04, 0x00, 0x14
    0x08, 0x3A, 0x00, 0x02, 0x00, 0x20, 0x2C, 0x08
]

###########################################################
# PPU memory
###########################################################

class PPUMemory

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting PPU memory"
        @createNamesAttrs()
        @createPaletts()

    ###########################################################
    # PPU memory access
    ###########################################################

    read: (address) ->
        address = @mapAddress address
        if      address < 0x2000 then @readPattern  address # $0000-$1FFF
        else if address < 0x3F00 then @readNameAttr address # $2000-$3EFF
        else                          @readPalette  address # $3F00-$3FFF

    write: (address, value) ->
        address = @mapAddress address
        if      address < 0x2000 then @writePattern  address, value # $0000-$1FFF
        else if address < 0x3F00 then @writeNameAttr address, value # $2000-$3EFF
        else                          @writePalette  address, value # $3F00-$3FFF

    mapAddress: (address) ->
        address & 0x3FFF # Mirroring of [$0000-$3FFF] in [$0000-$FFFF]

    ###########################################################
    # Patterns access ($0000-$1FFF)
    ###########################################################

    resetPatterns: (mapper) ->
        if mapper.chrRAM
            @patterns = mapper.chrRAM
            @canWritePattern = true
        else
            @patterns = mapper.chrROM
            @canWritePattern = false
        @chrMapping = []

    readPattern: (address) ->
        @patterns[@mapPatternAddress address]

    writePattern: (address, value) ->
        if @canWritePattern
            @patterns[@mapPatternAddress address] = value
        else
            value # Read-only

    mapPatternAddress: (address) ->
        @chrMapping[address & 0x1C00] | address & 0x03FF

    mapPatternsBank: (srcBank, dstBank) ->
        @chrMapping[srcBank * 0x0400] = dstBank * 0x0400 # 1K bank

    ###########################################################
    # Names/attributes access ($2000-$3EFF)
    ###########################################################

    createNamesAttrs: ->
        @namesAttrs = system.allocateBytes 0x1000 # Max. 4KB
        undefined

    resetNamesAttrs: (mapper) ->
        @setNamesAttrsMirroring mapper.mirroring

    readNameAttr: (address) ->
        @namesAttrs[@mapNameAttrAddres address]

    writeNameAttr: (address, value) ->
        @namesAttrs[@mapNameAttrAddres address] = value

    mapNameAttrAddres: (address) ->
        @namesAttrsMapping[address & 0x0C00] | address & 0x03FF

    mapNamesAttrsAreas: (area0, area1, area2, area3) ->
        @namesAttrsMapping ?= []
        @namesAttrsMapping[0x0000] = area0 * 0x0400
        @namesAttrsMapping[0x0400] = area1 * 0x0400
        @namesAttrsMapping[0x0800] = area2 * 0x0400
        @namesAttrsMapping[0x0C00] = area3 * 0x0400

    setNamesAttrsMirroring: (mirroring) ->
        switch mirroring                   # Mirroring of areas [A|B|C|D] in [$2000-$2FFF]
            when Mirroring.SINGLE_SCREEN_0 then @mapNamesAttrsAreas 0, 0, 0, 0
            when Mirroring.SINGLE_SCREEN_1 then @mapNamesAttrsAreas 1, 1, 1, 1
            when Mirroring.SINGLE_SCREEN_2 then @mapNamesAttrsAreas 2, 2, 2, 2
            when Mirroring.SINGLE_SCREEN_3 then @mapNamesAttrsAreas 3, 3, 3, 3
            when Mirroring.HORIZONTAL      then @mapNamesAttrsAreas 0, 0, 1, 1
            when Mirroring.VERTICAL        then @mapNamesAttrsAreas 0, 1, 0, 1
            when Mirroring.FOUR_SCREEN     then @mapNamesAttrsAreas 0, 1, 2, 3
            else throw new Error "Undefined mirroring (#{mirroring})"

    ###########################################################
    # Palettes access ($3F00-$3FFF)
    ###########################################################

    createPaletts: ->
        @paletts = system.allocateBytes 0x20 # 2 * 16B palette (background / sprites)
        @paletts[i] = POWER_UP_PALETTES[i] for i in [0...@paletts.length]
        undefined

    readPalette: (address) ->
        @paletts[@mapPaletteAddress address]

    writePalette: (address, value) ->
        @paletts[@mapPaletteAddress address] = value

    mapPaletteAddress: (address) ->
        if address & 0x0003
            address & 0x001F # Mirroring of [$3F00-$3F1F] in [$3F00-$3FFF]
        else
            address & 0x000F # $3F10/$3F14/$3F18/$3F1C are mirrorors of $3F00/$3F04/$3F08$/3F0C

    ###########################################################
    # Mapper connection
    ###########################################################

    connectMapper: (mapper) ->
        @resetPatterns mapper
        @resetNamesAttrs mapper

module.exports = PPUMemory
