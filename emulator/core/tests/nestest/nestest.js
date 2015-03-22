//=============================================================================
// Test:   nestest
// Source: http://nickmass.com/images/nestest.nes
//=============================================================================

import { NestestCPU } from "./nestest-cpu"
import { FakeUnit }   from "../../debug/fake-unit"

export const name = "nestest";
export const rom = "./emulator/core/tests/nestest/nestest.nes"

export function configure(config) {
    config["cpu"] = NestestCPU;
    config["ppu"] = FakeUnit;
    config["apu"] = FakeUnit;
}

export function execute(test) {
    const BASIC_LOG_FILE = "./temp/nestest.log";                                 // This is what we will compare with the verified log
    const VERBOSE_LOG_FILE = "./temp/nestest-full.log";                          // Contains more information for better debugging
    const VERIFIED_LOG_FILE = "./emulator/core/tests/nestest/nintendulator.log"; // Verified log from Nintendulator (modified to match structure of CFxNES log)

    test.openLog("debug-basic", BASIC_LOG_FILE);
    test.openLog("debug-verbose", VERBOSE_LOG_FILE);
    test.step(8991);

    var verifiedLog = test.readFile(VERIFIED_LOG_FILE);

    try {
        test.expect(BASIC_LOG_FILE).to.have.content(verifiedLog);
    } catch (error) {
        // The default error message contains whole log which is completely unreadable and useless
        test.fail(`CFxNES log differs from Nintendulator log.
                   - Run 'vimdiff ${BASIC_LOG_FILE} ${VERIFIED_LOG_FILE}' to see differences.
                   - See contents of '${VERBOSE_LOG_FILE}' for more detailed output.`);
    }
}
