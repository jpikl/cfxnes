###########################################################
# Basic dependency configuration
###########################################################

class BaseConfig

    "nes":              { module: "units/nes",                   singleton: true  }
    "cpu":              { module: "units/cpu",                   singleton: true  }
    "ppu":              { module: "units/ppu",                   singleton: true  }
    "apu":              { module: "units/apu",                   singleton: true  }
    "dma":              { module: "units/dma",                   singleton: true  }
    "cpuMemory":        { module: "units/cpu-memory",            singleton: true  }
    "ppuMemory":        { module: "units/ppu-memory",            singleton: true  }
    "cartridgeFactory": { module: "factories/cartridge-factory", singleton: true  }
    "loaderFactory":    { module: "factories/loader-factory",    singleton: true  }
    "mapperFactory":    { module: "factories/mapper-factory",    singleton: true  }
    "storage":          { module: "storages/local-storage",      singleton: true  }
    "joypad":           { module: "controllers/joypad",          singleton: false }
    "zapper":           { module: "controllers/zapper",          singleton: false }

module.exports = BaseConfig
