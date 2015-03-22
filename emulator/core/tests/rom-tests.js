
import chai             from "chai"
import chaiFs           from "chai-fs"
import fs               from "fs"
import * as nestest     from "./nestest/nestest"
import baseConfig       from "../config/base-config"
import { dataToString } from "../utils/convert"
import { Injector }     from "../utils/inject"
import { Logger }       from "../utils/logger"

chai.use(chaiFs);

describe("CPU", () => {
    itShouldPass(nestest);
    // itShouldPass("instr_test-v4");
    // itShouldPass("instr_timing");
});

// describe("PPU", () => {
//     itShouldPass("ppu_vbl_nmi");
// });

function itShouldPass(test) {
    it(`should pass '${test.name}'`, () => execute(test));
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

        step(count = 1) {
            for (var i = 0; i < count; i++) {
                nes.step();
            }
        },

        readByte: function(address) {
            return cpuMemory.read(address);
        },

        readString: function(address) {
            var data = [];
            while (true) {
                var value = this.readByte(address++);
                if (value === 0) {
                    break;
                }
                data.push(value);
            }
            return dataToString(bytes);
        },

        readFile: function(file) {
            return fs.readFileSync(file, "utf8");
        },

        openLog: function(id, file) {
            loggerIds.push(id);
            var logger = Logger.get(id);
            logger.attach(Logger.file(file));
            return logger;
        },

        blargg: () => {
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
