//=============================================================================
// Test:   nestest
// Source: http://nickmass.com/images/nestest.nes
//=============================================================================

import fs from 'fs';
import {CPU, DisabledAPU, DisabledPPU} from '../units';

export const dir = './test/roms/nestest';
export const file = 'nestest.nes';

export function init() {
  return {cpu: new NestestCPU, apu: new DisabledAPU, ppu: new DisabledPPU};
}

export function execute(test) {
  const currentLogFile = test.getOutputPath('nestest.log'); // This is what we will compare with the verified log
  const verifiedLogFile = test.getPath('nestest.log');    // Verified log from Nintendulator (modified to match structure of cfxnes log)

  test.nes.cpu.openLog(currentLogFile);
  test.power();
  test.step(8991);
  test.nes.cpu.closeLog();

  const currentLog = fs.readFileSync(currentLogFile, 'utf8');
  const verifiedLog = fs.readFileSync(verifiedLogFile, 'utf8');

  try {
    test.expect(currentLog).to.equal(verifiedLog);
  } catch (error) {
    // The default error message contains whole log which is completely unreadable and useless
    test.fail(`cfxnes log differs from Nintendulator log.
        Run 'vimdiff ${currentLogFile} ${verifiedLogFile}' to compare differences.`);
  }
}

class NestestCPU extends CPU {

  openLog(path) {
    this.log = fs.openSync(path, 'w');
  }

  closeLog() {
    fs.closeSync(this.log);
  }

  handleReset() {
    super.handleReset();
    this.programCounter = 0xC000; // Where the test starts
  }

  executeOperation([instruction, addressingMode]) {
    const A = byteAsHex(this.accumulator);
    const X = byteAsHex(this.registerX);
    const Y = byteAsHex(this.registerY);
    const P = byteAsHex(this.getStatus());
    const SP = byteAsHex(this.stackPointer);
    const PC = this.programCounter - 1;

    const addr = addressingMode.call(this);
    const instr = instruction.name;
    const size = this.programCounter - PC;

    const data0 = byteAsHex(this.readByte(PC));
    const data1 = size > 1 ? byteAsHex(this.readByte((PC + 1) & 0xFFFF)) : '  ';
    const data2 = size > 2 ? byteAsHex(this.readByte((PC + 2) & 0xFFFF)) : '  ';

    instruction.call(this, addr);

    fs.writeSync(this.log, `${wordAsHex(PC)}  ${data0} ${data1} ${data2}  ${instr}  A:${A} X:${X} Y:${Y} P:${P} SP:${SP}\n`);
  }

}

function byteAsHex(value) {
  const hex = value.toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

function wordAsHex(value) {
  const hex1 = byteAsHex(value & 0xFF);
  const hex2 = byteAsHex(value >>> 8);
  return hex2 + hex1;
}
