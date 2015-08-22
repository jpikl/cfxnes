import { NES }              from "./nes";
import { CPU }              from "./units/cpu";
import { PPU }              from "./units/ppu";
import { APU }              from "./units/apu";
import { DMA }              from "./units/dma";
import { CPUMemory }        from "./units/cpu-memory";
import { PPUMemory }        from "./units/ppu-memory";
import { CartridgeFactory } from "./factories/cartridge-factory";
import { DeviceFactory }    from "./factories/device-factory";
import { MapperFactory }    from "./factories/mapper-factory";
import { PaletteFactory }   from "./factories/palette-factory";

//=========================================================
// Emulator core configuration
//=========================================================

export default {
    "nes":              {type: "class", value: NES},
    "cpu":              {type: "class", value: CPU},
    "ppu":              {type: "class", value: PPU},
    "apu":              {type: "class", value: APU},
    "dma":              {type: "class", value: DMA},
    "cpuMemory":        {type: "class", value: CPUMemory},
    "ppuMemory":        {type: "class", value: PPUMemory},
    "cartridgeFactory": {type: "class", value: CartridgeFactory},
    "deviceFactory":    {type: "class", value: DeviceFactory},
    "mapperFactory":    {type: "class", value: MapperFactory},
    "paletteFactory":   {type: "class", value: PaletteFactory},
    "hash":             {type: "value", value: null}, // Optional external dependency
    "jszip":            {type: "value", value: null}  // Optional external dependency
};
