###########################################################
# Basic dependency configuration
###########################################################

class BaseConfig

    nes:              { module: "src/NES",              singleton: true }
    cpu:              { module: "src/CPU",              singleton: true }
    ppu:              { module: "src/PPU",              singleton: true }
    papu:             { module: "src/PAPU",             singleton: true }
    cpuMemory:        { module: "src/CPUMemory",        singleton: true }
    ppuMemory:        { module: "src/PPUMemory",        singleton: true }
    cartridgeFactory: { module: "src/CartridgeFactory", singleton: true }
    loaderFactory:    { module: "src/LoaderFactory",    singleton: true }
    mapperFactory:    { module: "src/MapperFactory",    singleton: true }

module.exports = BaseConfig
