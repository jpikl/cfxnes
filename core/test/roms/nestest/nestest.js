//=============================================================================
// Test:   nestest
// Source: http://nickmass.com/images/nestest.nes
//=============================================================================

import fs from 'fs';
import {LoggingCPU, DisabledAPU, DisabledPPU} from '../units';
import {LogLevel, LogWriter} from '../../../src/utils';

export const dir = './test/roms/nestest';
export const file = 'nestest.nes';

export function mock(units) {
  units.cpu = new NestestCPU;
  units.apu = new DisabledAPU;
  units.ppu = new DisabledPPU;
}

export function execute(test) {
  const basicLogFile = test.getOutputPath('nestest.log');        // This is what we will compare with the verified log
  const verboseLogFile = test.getOutputPath('nestest-full.log'); // Contains more information for easier debugging
  const verifiedLogFile = test.getPath('nestest.log');           // Verified log from Nintendulator (modified to match structure of CFxNES log)

  const cpu = test.nes.cpu;
  const basicLogger = cpu.basicLogger;
  const verboseLogger = cpu.verboseLogger;

  basicLogger.setLevel(LogLevel.INFO);
  basicLogger.attach(LogWriter.toFile(basicLogFile));
  verboseLogger.setLevel(LogLevel.INFO);
  verboseLogger.attach(LogWriter.toFile(verboseLogFile));

  test.power();
  test.step(8991);
  cpu.stopLogging();

  const basicLog = fs.readFileSync(basicLogFile, 'utf8');
  const verifiedLog = fs.readFileSync(verifiedLogFile, 'utf8');

  try {
    test.expect(basicLog).to.be.equal(verifiedLog);
  } catch (error) {
    // The default error message contains whole log which is completely unreadable and useless
    test.fail(`CFxNES log differs from Nintendulator log.
        - Run 'vimdiff ${basicLogFile} ${verifiedLogFile}' to see differences.
        - See contents of ${verboseLogFile} for more detailed output.`);
  }
}

class NestestCPU extends LoggingCPU {

  constructor() {
    super();
    this.stateAfterOperation = false;
  }

  handleReset() {
    super.handleReset();
    this.programCounter = 0xC000; // Where the test starts
  }

}
