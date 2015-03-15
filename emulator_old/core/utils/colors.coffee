system = require "./system"

###########################################################
# Color manipulation utilities
###########################################################

colors =

    pack: (r, g = r, b = r, a = 0xFF) ->
        if system.littleEndian
            a << 24 | b << 16 | g << 8 | r
        else
            r << 24 | g << 16 | b << 8 | a

    unpack: (color) ->
        if system.littleEndian
            [ color & 0xFF, (color >>> 8) & 0xFF, (color >>> 16) & 0xFF, (color >>> 24) & 0xFF ]
        else
            [ (color >>> 24) & 0xFF, (color >>> 16) & 0xFF, (color >>> 8) & 0xFF, color & 0xFF ]

colors.BLACK = colors.pack 0

module.exports = colors
