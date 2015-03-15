###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig

    "nes":              require "../nes"
    "cpu":              require "../units/cpu"
    "ppu":              require "../units/ppu"
    "apu":              require "../units/apu"
    "dma":              require "../units/dma"
    "cpuMemory":        require "../units/cpu-memory"
    "ppuMemory":        require "../units/ppu-memory"
    "cartridgeFactory": require "../factories/cartridge-factory"
    "deviceFactory":    require "../factories/device-factory"
    "loaderFactory":    require "../factories/loader-factory"
    "mapperFactory":    require "../factories/mapper-factory"
    "paletteFactory":   require "../factories/palette-factory"

module.exports = BaseConfig
