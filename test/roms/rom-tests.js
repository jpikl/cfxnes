//=============================================================================
// Collection of ROM-based tests
// Source: http://wiki.nesdev.com/w/index.php/Emulator_tests
//=============================================================================

import chai               from "chai"
import fs                 from "fs"
import * as nestest       from "./nestest/nestest"
import * as instr_test    from "./instr_test/instr_test-v4"
import * as instr_timing  from "./instr_timing/instr_timing"
import * as instr_misc    from "./instr_misc/instr_misc"
import * as cpu_reset     from "./cpu_reset/cpu_reset"
import * as ppu_vbl_nmi   from "./ppu_vbl_nmi/ppu_vbl_nmi"
import * as apu_reset     from "./apu_reset/apu_reset"
import * as apu_test      from "./apu_test/apu_test"
import baseConfig         from "../../src/lib/core/config/base-config"
import { dataToString }   from "../../src/lib/core/utils/convert"
import { Injector }       from "../../src/lib/core/utils/inject"
import { Logger }         from "../../src/lib/core/utils/logger"
import { copyProperties } from "../../src/lib/core/utils/objects"

describe("Validation ROMs", () => {
    validate(nestest);
    validate(instr_test);
    validate(instr_timing);
    validate(instr_misc);
    validate(cpu_reset);
    validate(ppu_vbl_nmi);
    validate(apu_reset);
    validate(apu_test);
});

function validate(test) {
    var names = test.names || [ test.name ];
    var files = test.files || [ test.file ];
    for (let i = 0; i < files.length; i++) {
        it(names[i], () => execute(test, files[i]));
    }
}

function execute(test, file) {
    var config = copyProperties(baseConfig);
    test.configure(config);

    var injector = new Injector(config);
    var cartridgeFactory = injector.get("cartridgeFactory");
    var cartridge = cartridgeFactory.fromLocalFile(file);
    var cpuMemory = injector.get("cpuMemory");
    var nes = injector.get("nes");
    nes.insertCartridge(cartridge);

    test.execute({
        assert: chai.assert,
        expect: chai.expect,

        fail(message) {
            this.assert(false, message);
        },

        power() {
            nes.pressPower();
        },

        reset() {
            nes.pressReset();
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
            Logger.get(id).attach(Logger.toFile(file));
        },

        closeLog(id) {
            Logger.get(id).close();
        },

        blargg() {
            // Test code for all Blargg's test ROMs
            const RESULT_ADDRESS = 0x6000;
            const RESULT_RUNNING = 0x80;
            const RESULT_RESET = 0x81;
            const RESULT_OK = 0x00;
            const MESSAGE_ADDRESS = 0x6004;

            var result;
            while ((result = this.readByte(RESULT_ADDRESS)) !== RESULT_RUNNING) {
                this.step(); // Wait until test starts
            }
            while ((result = this.readByte(RESULT_ADDRESS)) === RESULT_RUNNING) {
                this.step(); // Wait while test is in progress
            }
            if (result === RESULT_RESET) {
                this.step(200000); // Reset needs to be done after at least 100 msec (~122880 cpu ticks)
                this.reset();
                while ((result = this.readByte(RESULT_ADDRESS)) !== RESULT_RUNNING) {
                    this.step(); // Wait until test resumes
                }
                while ((result = this.readByte(RESULT_ADDRESS)) === RESULT_RUNNING) {
                    this.step(); // Wait while test is in progress
                }
            }

            var message = this.readString(MESSAGE_ADDRESS);
            this.assert(result === RESULT_OK, "\n" + message);
        }
    });
}
