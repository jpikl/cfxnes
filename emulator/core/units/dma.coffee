logger = require("../utils/logger").get()

###########################################################
# Direct memory access unit
###########################################################

TOTAL_DMA_CYCLES = 0x200 # Total 512 CPU cycles for DMA transfer.

class DMA

    @dependencies: [ "cpuMemory" ]

    init: (cpuMemory) ->
        @cpuMemory = cpuMemory

    powerUp: ->
        logger.info "Reseting DMA"
        @cyclesCount = TOTAL_DMA_CYCLES

    writeAddress: (address) ->
        @cyclesCount = 0
        @baseAddress = address << 8 # Source memory address (multiplied by 0x100)
        @cpuMemory.write 0x2003, 0  # Destination OAM address
        address

    tick: ->
        if @isTransferInProgress()
            @cyclesCount++
            @transferData() if @cyclesCount & 1  # Each even cyclesCount.

    isTransferInProgress: ->
        @cyclesCount < TOTAL_DMA_CYCLES

    transferData: ->
        address = @baseAddress + (@cyclesCount >> 1)
        data = @cpuMemory.read address
        @cpuMemory.write 0x2004, data # Automatically increments destination address

module.exports = DMA
