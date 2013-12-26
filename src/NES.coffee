###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "mapperFactory" ]
        
    insertCartridge: (cartridge) ->
        @mmc = @mapperFactory.createMapper cartridge
        @mmc.powerUp()
        @ppuMemory.connectToMMC @mmc
        @cpuMemory.connectToMMC @mmc

    pressPower: ->
        @mmc?.powerUp()
        @apu.powerUp()
        @ppuMemory.powerUp()
        @ppu.powerUp()
        @cpuMemory.powerUp()
        @cpu.powerUp()

    pressReset: ->
        @cpu.reset()

    step: ->
        @cpu.step()

module.exports = NES
