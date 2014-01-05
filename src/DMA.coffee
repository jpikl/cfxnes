###########################################################
# Direct memory access unit
###########################################################

class DMA

    @inject: [ "cpuMemory" ]

    powerUp: ->
        @cycle = 0x200
        @baseAddress = 0

    writeAddress: (address) ->
        @cycle = 0
        @baseAddress = address << 8 # Multiplied by 0x100

    tick: ->
        @transferData() if @isTransferCycle()

    isTransferCycle: ->
        @cycle < 0x200 and @cycle & 0x01 # Each even cycle in total 512 CPU cycles

    transferData: ->
        offset = @cycle >> 1
        data = @cpuMemory.read @baseAddress + offset
        @cpuMemory.write 0x2003, offset
        @ppuMemory.write 0x2004, data
        @cycle++

module.exports = DMA
