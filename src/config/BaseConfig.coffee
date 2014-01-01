###########################################################
# Basic dependency configuration
###########################################################

class BaseConfig

    nes:              { module: "NES",              singleton: true }
    cpu:              { module: "CPU",              singleton: true }
    ppu:              { module: "PPU",              singleton: true }
    apu:              { module: "APU",              singleton: true }
    cpuMemory:        { module: "CPUMemory",        singleton: true }
    ppuMemory:        { module: "PPUMemory",        singleton: true }
    cartridgeFactory: { module: "CartridgeFactory", singleton: true }
    loaderFactory:    { module: "LoaderFactory",    singleton: true }
    mapperFactory:    { module: "MapperFactory",    singleton: true }

module.exports = BaseConfig
