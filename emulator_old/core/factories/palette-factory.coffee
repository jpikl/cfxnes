###########################################################
# Factory for palette creation
###########################################################

class PaletteFactory

    constructor: ->
        @palettes =
            "default":   require "../palettes/default-palette"
            "bright":    require "../palettes/bright-palette"
            "realistic": require "../palettes/realistic-palette"

    createPalette: (id) ->
        @palettes[id]

module.exports = PaletteFactory
