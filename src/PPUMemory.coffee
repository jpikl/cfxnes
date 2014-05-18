Types = require "../Types"

Mirroring = Types.Mirroring

h = require("../utils/Format").wordAsHex

###########################################################
# PPU memory
###########################################################

class PPUMemory

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @createNamesAttrs()
        @createPaletts()

    ###########################################################
    # PPU memory access
    ###########################################################

    read: (address) ->
        address = @$mapAddress address
        if      address < 0x2000 then @$readCHRMemory  address # $0000-$1FFF
        else if address < 0x3F00 then @$readNamesAttrs address # $2000-$3EFF
        else                          @$readPaletts    address # $3F00-$3FFF

    write: (address, value) ->
        address = @$mapAddress address
        if      address < 0x2000 then @$writeCHRMemory  address, value # $0000-$1FFF
        else if address < 0x3F00 then @$writeNamesAttrs address, value # $2000-$3EFF
        else                          @$writePaletts    address, value # $3F00-$3FFF

    mapAddress: (address) ->
        address & 0x3FFF # Mirroring of [$0000-$3FFF] in [$0000-$FFFF]

    ###########################################################
    # CHR ROM/RAM access ($0000-$1FFF)
    ###########################################################

    resetCHRMemory: (mapper) ->
        if mapper.chrRAM
            @chrMemory = mapper.chrRAM
            @hasCHRRAM = true
        else
            @chrMemory = mapper.chrROM
            @hasCHRRAM = false
        @chrMapping = []

    readCHRMemory: (address) ->
        @chrMemory[@mapCHRMemoryAddress address]

    writeCHRMemory: (address, value) ->
        if @hasCHRRAM
            @chrMemory[@mapCHRMemoryAddress address] = value
        else
            value # Read-only

    mapCHRMemoryAddress: (address) ->
        @chrMapping[address & 0x1C00] | address & 0x03FF

    mapCHRMemoryBank: (srcBank, dstBank) ->
        @chrMapping[srcBank * 0x0400] = dstBank * 0x0400 # 1K bank

    ###########################################################
    # Names/attributes access ($2000-$3EFF)
    ###########################################################

    createNamesAttrs: ->
        @namesAttrs = (0 for [0...0x1000]) # Max. 4KB
        undefined

    resetNamesAttrs: (mapper) ->
        @setNamesAttrsMirroring mapper.mirroring

    readNamesAttrs: (address) ->
        @namesAttrs[@mapNamesAttrsAddress address]

    writeNamesAttrs: (address, value) ->
        @namesAttrs[@mapNamesAttrsAddress address] = value

    mapNamesAttrsAddress: (address) ->
        @namesAttrsMapping[address & 0x0C00] | address & 0x03FF

    mapNamesAttrsAreas: (area1, area2, area3, area4) ->
        @namesAttrsMapping ?= []
        @namesAttrsMapping[0x0000] = area1 * 0x0400
        @namesAttrsMapping[0x0400] = area2 * 0x0400
        @namesAttrsMapping[0x0800] = area3 * 0x0400
        @namesAttrsMapping[0x0C00] = area4 * 0x0400

    setNamesAttrsMirroring: (mirroring) ->
        switch mirroring                   # Mirroring of areas [A|B|C|D] in [$2000-$2FFF]
            when Mirroring.SINGLE_SCREEN_1 then @mapNamesAttrsAreas 0, 0, 0, 0
            when Mirroring.SINGLE_SCREEN_2 then @mapNamesAttrsAreas 1, 1, 1, 1
            when Mirroring.HORIZONTAL      then @mapNamesAttrsAreas 0, 0, 1, 1
            when Mirroring.VERTICAL        then @mapNamesAttrsAreas 0, 1, 0, 1
            when Mirroring.FOUR_SCREEN     then @mapNamesAttrsAreas 0, 1, 2, 3

    ###########################################################
    # Pallete access ($3F00-$3FFF)
    ###########################################################

    createPaletts: ->
        @paletts = (0 for [0...0x20]) # 2 * 16B palette (background / sprites)
        undefined

    readPaletts: (address) ->
        @paletts[@$mapPalettsAddress address]

    writePaletts: (address, value) ->
        @paletts[@$mapPalettsAddress address] = value

    mapPalettsAddress: (address) ->
        if address & 0x0003
            address & 0x001F # Mirroring of [$3F00-$3F1F] in [$3F00-$3FFF]
        else
            address & 0x000F # $3F10/$3F14/$3F18/$3F1C are mirrorors of $3F00/$3F04/$3F08$/3F0C

    ###########################################################
    # Mapper connection
    ###########################################################

    connectMapper: (mapper) ->
        mapper.ppuMemory = this
        @resetCHRMemory mapper
        @resetNamesAttrs mapper

module.exports = PPUMemory
