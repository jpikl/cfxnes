INESLoader = require "./INESLoader"
Types      = require "../Types"

TVSystem = Types.TVSystem

###########################################################
# Loader for the NES 2.0 ROM format
###########################################################

class NES2Loader extends INESLoader

    @supportsInput: (reader) ->
        if INESLoader.supportsInput reader                # Bytes 0-3 of header
            flags = reader.read 4
            flags.length is 4 and flags[3] & 0x0C is 0x08 # Byte 7 of header
        else
            false

    ###########################################################
    # Header reading
    ###########################################################

    readByte8: ->
        flags = @readByte()
        @cartridge.mapperId |= (flags & 0x0F) << 8
        @cartridge.subMapperId = (flags & 0xF0) >>> 4

    readByte9: ->
        flags = @readByte()
        @cartridge.prgROMSize |= (flags & 0x0F) << 8
        @cartridge.chrROMSize |= (flags & 0xF0) << 4

    readByte10: ->
        flags = @readByte()
        @cartridge.prgRAMSizeBattery = (flags & 0xF0) >>> 4
        @cartridge.prgRAMSize = (flags & 0x0F) + @cartridge.prgRAMSizeBattery
        @cartridge.hasPRGRAM = @cartridge.prgRAMSize != 0
        @cartridge.hasPRGRAMBattery ||= @cartridge.prgRAMSizeBattery != 0 # Was set from byte 6

    readByte11: ->
        flags = @readByte()
        @cartridge.chrRAMSizeBattery = (flags & 0xF0) >>> 4
        @cartridge.chrRAMSize = (flags & 0x0F) + @cartridge.chrRAMSizeBattery
        @cartridge.hasCHRRAM = @cartridge.chrRAMSize != 0
        @cartridge.hasCHRRAMBattery = @cartridge.chrRAMSizeBattery != 0

    readByte12: ->
        flags = @readByte()
        @cartridge.tvSystem = if flags & 0x01 then TVSystem.PAL else TVSystem.NTSC

module.exports = NES2Loader
