###########################################################
# Factory for palette creation
###########################################################

class PaletteFactory

    createPalette: (id) ->
        require "../palettes/#{id}-palette"

module.exports = PaletteFactory
