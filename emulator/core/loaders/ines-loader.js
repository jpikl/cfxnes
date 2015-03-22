import { AbstractLoader } from "./abstract-loader";
import { Mirroring }      from "../common/types";
import { TVSystem }       from "../common/types";

const INES_SIGNATURE = [ 0x4E, 0x45, 0x53, 0x1A ]; // "NES^Z"

//=========================================================
// Loader for the iNES ROM format
//=========================================================

export class INESLoader extends AbstractLoader {

    constructor() {
        super("iNES");
    }

    supports(reader) {
        return reader.contains(INES_SIGNATURE);
    }

    read(reader, cartridge) {
        this.readHeader(reader, cartridge);  //  16 B [$00-$0F]
        this.readTrainer(reader, cartridge); // 512 B (optional)
        this.readPRGROM(reader, cartridge);  //  16KB x number of units
        this.readCHRROM(reader, cartridge);  //   8KB x number of units
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
        var units = reader.readByte() || 1; // At least 1 unit (compatibility purposes)
        if (cartridge.hasCHRRAM) {
            return cartridge.chrRAMSize = units * 0x2000; // N x 8KB
        }
    }

    readByte9(reader, cartridge) {
        var flags = reader.readByte();
        cartridge.tvSystem = flags & 0x01 ? TVSystem.PAL : TVSystem.NTSC;
    }

    readByte10(reader, cartridge) {
        var flags = reader.readByte();
        if (flags & 0x02) {
            cartridge.tvSystem = TVSystem.PAL; // Overrides previous value
        }
        cartridge.hasPRGRAM = (flags & 0x10) === 0;
        cartridge.hasBUSConflicts = (flags & 0x20) !== 0;
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

}
