###########################################################
# Direct memory access unit
###########################################################

class DMA

    @inject: [ "cpuMemory" ]

    powerUp: ->
        @cycle = 0x200

    writeAddress: (address) ->
        @cycle = 0
        @baseAddress = address << 8 # Source memory address (multiplied by 0x100)
        @cpuMemory.write 0x2003, 0  # Destination OAM address
        address

    tick: ->
        if @isTransferInProgress()
            @cycle++
            @transferData() if @cycle & 0x01  # Each even cycle.

    isTransferInProgress: ->
        @cycle < 0x200 # Total 512 CPU cycles.

    transferData: ->
        address = @baseAddress + (@cycle >> 1)
        data = @cpuMemory.read address
        @cpuMemory.write 0x2004, data # Automatically increments destination address

module.exports = DMA
