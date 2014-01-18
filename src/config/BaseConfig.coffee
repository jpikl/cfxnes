###########################################################
# Basic dependency configuration
###########################################################

class BaseConfig

    nes:              { module: "NES",                singleton: true  }
    cpu:              { module: "CPU",                singleton: true  }
    ppu:              { module: "PPU",                singleton: true  }
    apu:              { module: "APU",                singleton: true  }
    dma:              { module: "DMA",                singleton: true  }
    cpuMemory:        { module: "CPUMemory",          singleton: true  }
    ppuMemory:        { module: "PPUMemory",          singleton: true  }
    cartridgeFactory: { module: "CartridgeFactory",   singleton: true  }
    loaderFactory:    { module: "LoaderFactory",      singleton: true  }
    mapperFactory:    { module: "MapperFactory",      singleton: true  }
    joypad:           { module: "controllers/Joypad", singleton: false }
    zapper:           { module: "controllers/Zapper", singleton: false }

module.exports = BaseConfig
