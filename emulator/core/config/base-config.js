import { NES }              from "../nes";
import { CPU }              from "../units/cpu";
import { PPU }              from "../units/ppu";
import { APU }              from "../units/apu";
import { DMA }              from "../units/dma";
import { CPUMemory }        from "../units/cpu-memory";
import { PPUMemory }        from "../units/ppu-memory";
import { CartridgeFactory } from "../factories/cartridge-factory";
import { DeviceFactory }    from "../factories/device-factory";
import { MapperFactory }    from "../factories/mapper-factory";
import { PaletteFactory }   from "../factories/palette-factory";
import { MemoryStorage }    from "../storages/memory-storage"
import { Config }           from "../utils/inject";

//=========================================================
// Base configuration of emulator core
//=========================================================

export default new Config({

    "nes":              NES,
    "cpu":              CPU,
    "ppu":              PPU,
    "apu":              APU,
    "dma":              DMA,
    "cpuMemory":        CPUMemory,
    "ppuMemory":        PPUMemory,
    "cartridgeFactory": CartridgeFactory,
    "deviceFactory":    DeviceFactory,
    "mapperFactory":    MapperFactory,
    "paletteFactory":   PaletteFactory,
    "storage":          MemoryStorage

});
