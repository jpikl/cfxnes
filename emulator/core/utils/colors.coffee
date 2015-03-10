# Typed array byte order depends on CPU endianness
littleEndian = do ->
    buffer =  new ArrayBuffer 4
    u32 = new Uint32Array buffer
    u8 = new Uint8Array buffer
    u32[0] = 0xFF
    u8[0] is 0xFF

###########################################################
# Color manipulation utilities
###########################################################

colors =

    pack: (r, g = r, b = r, a = 0xFF) ->
        if littleEndian
            a << 24 | b << 16 | g << 8 | r
        else
            r << 24 | g << 16 | b << 8 | a

    unpack: (color) ->
        if littleEndian
            [ color & 0xFF, (color >>> 8) & 0xFF, (color >>> 16) & 0xFF, (color >>> 24) & 0xFF ]
        else
            [ (color >>> 24) & 0xFF, (color >>> 16) & 0xFF, (color >>> 8) & 0xFF, color & 0xFF ]

colors.BLACK = colors.pack 0

module.exports = colors
