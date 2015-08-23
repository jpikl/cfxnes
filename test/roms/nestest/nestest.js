//=============================================================================
// Test:   nestest
// Source: http://nickmass.com/images/nestest.nes
//=============================================================================

import { LoggingCPU, DisabledAPU, DisabledPPU } from "../units"
import { LogLevel, LogWriter } from "../../../src/lib/core/utils/logger";

export const name = "nestest";
export const file = "./test/roms/nestest/nestest.nes";

const BASIC_LOG_FILE    = "./test/roms/nestest/nestest.log";       // This is what we will compare with the verified log
const VERBOSE_LOG_FILE  = "./test/roms/nestest/nestest-full.log";  // Contains more information for easier debugging
const VERIFIED_LOG_FILE = "./test/roms/nestest/nintendulator.log"; // Verified log from Nintendulator (modified to match structure of CFxNES log)

export function configure(config) {
    config["cpu"] = {type: "class", value: NestestCPU};
    config["apu"] = {type: "class", value: DisabledAPU};
    config["ppu"] = {type: "class", value: DisabledPPU};
}

export function execute(test) {
    test.step(8991);
    test.get("cpu").stopLogging();

    var basicLog = test.readFile(BASIC_LOG_FILE);
    var verifiedLog = test.readFile(VERIFIED_LOG_FILE);

    try {
        test.expect(basicLog).to.be.equal(verifiedLog);
    } catch (error) {
        // The default error message contains whole log which is completely unreadable and useless
        test.fail(`CFxNES log differs from Nintendulator log.
        - Run 'vimdiff ${BASIC_LOG_FILE} ${VERIFIED_LOG_FILE}' to see differences.
        - See contents of '${VERBOSE_LOG_FILE}' for more detailed output.`);
    }
}

class NestestCPU extends LoggingCPU {

    startLogging() {
        this.basicLogger.setLevel(LogLevel.INFO);
        this.basicLogger.attach(LogWriter.toFile(BASIC_LOG_FILE));
        this.verboseLogger.setLevel(LogLevel.INFO);
        this.verboseLogger.attach(LogWriter.toFile(VERBOSE_LOG_FILE));
        super.startLogging();
    }

    handleReset() {
        super.handleReset();
        this.programCounter = 0xC000; // Where the test start
    }

}
