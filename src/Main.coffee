Cartridge = require "./Cartridge"
Injector  = require "./utils/Injector"

dependencies = 
    nes:           { module: "NES",           singleton: true }
    cpu:           { module: "CPU",           singleton: true }
    ppu:           { module: "PPU",           singleton: true }
    papu:          { module: "PAPU",          singleton: true }
    cpuMemory:     { module: "CPUMemory",     singleton: true }
    ppuMemory:     { module: "PPUMemory",     singleton: true }
    loaderFactory: { module: "LoaderFactory", singleton: true }
    mapperFactory: { module: "MapperFactory", singleton: true }

if process?.argv[2] == "-d"
    dependencies.cpu.module = "debug/DebugCPU"

injector = new Injector dependencies

cartridge = Cartridge.fromServerFile "./nestest.nes"
nes = injector.getInstance "nes"
nes.insertCartridge cartridge
nes.step() for [1..100]
