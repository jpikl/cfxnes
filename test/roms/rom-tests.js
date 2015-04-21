//=============================================================================
// Collection of ROM-based tests
// Source: http://wiki.nesdev.com/w/index.php/Emulator_tests
//=============================================================================

import chai              from "chai"
import fs                from "fs"
import * as nestest      from "./nestest/nestest"
import * as instr_test   from "./instr_test/instr_test-v4"
import * as instr_timing from "./instr_timing/instr_timing"
import * as ppu_vbl_nmi  from "./ppu_vbl_nmi/ppu_vbl_nmi"
import baseConfig        from "../../src/lib/core/config/base-config"
import { dataToString }  from "../../src/lib/core/utils/convert"
import { Injector }      from "../../src/lib/core/utils/inject"
import { Logger }        from "../../src/lib/core/utils/logger"

describe("Validation ROMs", () => {
    validate(nestest);
    validate(instr_test);
    validate(instr_timing);
    validate(ppu_vbl_nmi);
});

function validate(test) {
    it(test.name, () => execute(test));
}

function execute(test) {
    var config = baseConfig.clone();
    test.configure(config);

    var injector = new Injector(config);
    var cartridgeFactory = injector.get("cartridgeFactory");
    var cartridge = cartridgeFactory.fromLocalFile(test.rom);
    var cpuMemory = injector.get("cpuMemory");
    var nes = injector.get("nes");

    nes.insertCartridge(cartridge);

    var loggerIds = [];

    test.execute({

        assert: chai.assert,
        expect: chai.expect,

        fail(message) {
            this.assert(false, message);
        },

        power() {
            nes.pressPower();
        },

        step(count = 1) {
            for (var i = 0; i < count; i++) {
                nes.step();
            }
        },

        readByte(address) {
            return cpuMemory.read(address);
        },

        readString(address) {
            var data = [];
            while (true) {
                var value = this.readByte(address++);
                if (value === 0) {
                    break;
                }
                data.push(value);
            }
            return dataToString(data);
        },

        readFile(file) {
            return fs.readFileSync(file, "utf8");
        },

        openLog(id, file) {
            loggerIds.push(id);
            var logger = Logger.get(id);
            logger.attach(Logger.file(file));
            return logger;
        },

        blargg() {
            // Test code for all Blargg's test ROMs
            const RESULT_ADDRESS = 0x6000;
            const RESULT_RUNNING = 0x80;
            const RESULT_OK = 0x00;
            const MESSAGE_ADDRESS = 0x6004;

            while (this.readByte(RESULT_ADDRESS) !== RESULT_RUNNING) {
                this.step();
            }

            while (this.readByte(RESULT_ADDRESS) === RESULT_RUNNING) {
                this.step();
            }

            var result = this.readByte(RESULT_ADDRESS);
            var message = this.readString(MESSAGE_ADDRESS);
            this.assert(result === RESULT_OK, "\n" + message);
        }

    });

    for (var id of loggerIds) {
        Logger.get(id).close();
    }
}
