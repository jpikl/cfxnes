###########################################################
# Base dependency injection configuration
###########################################################

class BaseConfig

    "nes":              "core/nes",
    "cpu":              "core/units/cpu"
    "ppu":              "core/units/ppu"
    "apu":              "core/units/apu"
    "dma":              "core/units/dma"
    "cpuMemory":        "core/units/cpu-memory"
    "ppuMemory":        "core/units/ppu-memory"
    "cartridgeFactory": "core/factories/cartridge-factory"
    "deviceFactory":    "core/factories/device-factory"
    "loaderFactory":    "core/factories/loader-factory"
    "mapperFactory":    "core/factories/mapper-factory"
    "paletteFactory":   "core/factories/palette-factory"

module.exports = BaseConfig
