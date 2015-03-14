###########################################################
# System utilities
###########################################################

littleEndian = do ->
    buffer =  new ArrayBuffer 4
    u32 = new Uint32Array buffer
    u8 = new Uint8Array buffer
    u32[0] = 0xFF
    u8[0] is 0xFF

system =

    littleEndian: littleEndian
    bigEndian: not littleEndian

    # In Chrome, typed arrays are much slower than generic arrays
    # for some reason, so we aren't using them.

    allocateBytes: (size) ->
        # new Uint8ClampedArray size
        data = new Array size
        data[i] = 0 for i in [0...data.length]
        data

    allocateInts: (size) ->
        # new Uint32Array size
        data = new Array size
        data[i] = 0 for i in [0...data.length]
        data

module.exports = system
