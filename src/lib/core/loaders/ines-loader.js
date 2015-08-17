import { AbstractLoader } from "./abstract-loader";
import { Mirroring }      from "../common/mirroring";
import { Region }         from "../common/region";

const INES_SIGNATURE = [0x4E, 0x45, 0x53, 0x1A ]; // "NES^Z"

var mappers = {
    0x00: "NROM",
    0x01: "MMC1",
    0x02: "UNROM",
    0x03: "CNROM",
    0x04: "MMC3",
    0x07: "AOROM"
};

//=========================================================
// Loader for the iNES ROM format
//=========================================================

export class INESLoader extends AbstractLoader {

    constructor(name) {
        super(name || "iNES");
    }

    supports(reader) {
        return reader.contains(INES_SIGNATURE);
    }

    read(reader, cartridge) {
        this.readHeader(reader, cartridge);  //  16 B [$00-$0F]
        this.readTrainer(reader, cartridge); // 512 B (optional)
        this.readPRGROM(reader, cartridge);  //  16KB x number of units
        this.readCHRROM(reader, cartridge);  //   8KB x number of units
        this.detectPRGRAM(cartridge);
        this.setMapper(cartridge);
        this.setSubmapper(cartridge);
    }

    //=========================================================
    // Header reading
    //=========================================================

    readHeader(reader, cartridge) {
        reader.check(INES_SIGNATURE);            // 4B [$00-$03]
        this.readPRGROMSize(reader, cartridge);  // 1B [$04]
        this.readCHRROMSize(reader, cartridge);  // 1B [$05]
        this.readControlBytes(reader, cartridge);// 2B [$06,$07]
        this.readByte8(reader, cartridge);       // 1B [$08]
        this.readByte9(reader, cartridge);       // 1B [$09]
        this.readByte10(reader, cartridge);      // 1B [$0A]
        this.readByte11(reader, cartridge);      // 1B [$0B]
        this.readByte12(reader, cartridge);      // 1B [$0C]
        this.readByte13(reader, cartridge);      // 1B [$0D]
        reader.skip(2);                          // 2B [$0E,$0F]
    }

    readPRGROMSize(reader, cartridge) {
        cartridge.prgROMSize = reader.readByte() * 0x4000; // N x 16KB
    }

    readCHRROMSize(reader, cartridge) {
        cartridge.chrROMSize = reader.readByte() * 0x2000; // N x 8KB
        cartridge.hasCHRRAM = cartridge.chrROMSize === 0;
        cartridge.chrRAMSize = cartridge.hasCHRRAM ? 0x2000 : undefined; // 8K if present
    }

    readControlBytes(reader, cartridge) {
        var control1 = reader.readByte();
        var control2 = reader.readByte();
        if (control1 & 0x08) {
            cartridge.mirroring = Mirroring.FOUR_SCREEN;
        } else if (control1 & 0x01) {
            cartridge.mirroring = Mirroring.VERTICAL;
        } else {
            cartridge.mirroring = Mirroring.HORIZONTAL;
        }
        cartridge.hasPRGRAMBattery = (control1 & 0x02) !== 0;
        cartridge.hasTrainer = (control1 & 0x04) !== 0;
        cartridge.isVsUnisistem = (control2 & 0x01) !== 0;
        cartridge.isPlayChoice = (control2 & 0x02) !== 0;
        cartridge.mapperId = (control2 & 0xF0) | (control1 >>> 4);
    }

    readByte8(reader, cartridge) {
        cartridge.prgRAMUnits = reader.readByte(); // Recent addition to iNES specification (virtually no ROM images use it)
    }

    readByte9(reader, cartridge) {
        // Virtually no ROM images use this byte, but it is part of the iNES specification.
        var flags = reader.readByte();
        cartridge.region = flags & 0x01 ? Region.PAL : Region.NTSC;
    }

    readByte10(reader, cartridge) {
        reader.skip(1);
    }

    readByte11(reader, cartridge) {
        reader.skip(1);
    }

    readByte12(reader, cartridge) {
        reader.skip(1);
    }

    readByte13(reader, cartridge) {
        reader.skip(1);
    }

    //=========================================================
    // Data reading
    //=========================================================

    readTrainer(reader, cartridge) {
        if (cartridge.hasTrainer) {
            cartridge.trainer = reader.read(0x200); // 512B
        }
    }

    readPRGROM(reader, cartridge) {
        cartridge.prgROM = reader.read(cartridge.prgROMSize);
    }

    readCHRROM(reader, cartridge) {
        cartridge.chrROM = reader.read(cartridge.chrROMSize);
    }

    //=========================================================
    // Mapper setup
    //=========================================================

    detectPRGRAM(cartridge) {
        // Now, we can finally deduce whether there is a PRG RAM and its size
        cartridge.hasPRGRAM = cartridge.hasPRGRAMBattery || cartridge.prgRAMUnits > 0;
        cartridge.prgRAMSize = cartridge.hasPRGRAM ? (cartridge.prgRAMUnits || 1) * 0x2000 : undefined; // N x 8KB (at least 1 unit) if present
    }

    setMapper(cartridge) {
        cartridge.mapper = mappers[cartridge.mapperId] || cartridge.mapperId.toString();
    }

    setSubmapper(cartridge) {
    }

}
