//=============================================================================
// Collection of ROM-based tests
// Source: http://wiki.nesdev.com/w/index.php/Emulator_tests
//=============================================================================

/* eslint-disable camelcase */

import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import {assert, expect} from 'chai';

import {NES, readCartridge} from '../../src';

import * as nestest from './nestest';
import * as instr_test from './instr_test';
import * as instr_timing from './instr_timing';
import * as instr_misc from './instr_misc';
import * as cpu_reset from './cpu_reset';
import * as cpu_interrupts from './cpu_interrupts';
import * as ppu_tests from './ppu_tests';
import * as ppu_vbl_nmi from './ppu_vbl_nmi';
import * as ppu_sprite_hit from './ppu_sprite_hit';
import * as ppu_sprite_overflow from './ppu_sprite_overflow';
import * as oam_read from './oam_read';
import * as oam_stress from './oam_stress';
import * as apu_reset from './apu_reset';
import * as apu_test from './apu_test';
import * as mmc3_test from './mmc3_test';
import * as bntest from './bntest';
import * as holydiverbatman from './holydiverbatman';

/* eslint-enable camelcase */

describe('roms', function() {
  this.timeout(60000);
  validate(nestest);
  validate(instr_test);
  validate(instr_timing);
  validate(instr_misc);
  validate(cpu_reset);
  validate(cpu_interrupts);
  validate(ppu_tests);
  validate(ppu_vbl_nmi);
  validate(ppu_sprite_hit); // 1 failing (disabled)
  validate(ppu_sprite_overflow); // 2 failing (disabled)
  validate(oam_read);
  validate(oam_stress);
  validate(apu_reset); // 4 failing (disabled)
  validate(apu_test); // 3 failing (disabled)
  validate(mmc3_test); // 1 failing (disabled)
  validate(bntest);
  validate(holydiverbatman);
});

function validate(test) {
  const baseName = path.basename(test.dir);
  if (test.file) {
    const file = path.join(test.dir, test.file);
    const name = baseName;
    const context = Object.assign({}, test, {file, name});
    it(name, () => execute(context));
  } else if (test.files) {
    for (let number = 0; number < test.files.length; number++) {
      const file = path.join(test.dir, test.files[number]);
      const name = path.basename(file, '.nes');
      const context = Object.assign({}, test, {file, name, number});
      it(`${baseName} (${name})`, () => execute(context));
    }
  }
}

function execute(test) {
  // Setup emulator
  const cartridge = readCartridge(test.file);
  const nes = new NES(test.init());
  nes.setCartridge(cartridge);

  // Prepare context
  const {number} = test;
  const context = {
    number, assert, expect, fail, power, reset, step, nes,
    readByte, readString, screenshot, blargg, getPath, getOutputPath,
  };

  // Execute test
  const asyncResults = [];
  test.execute(context);
  if (asyncResults.length) {
    return Promise.all(asyncResults);
  }
  return undefined;

  //==========================================================
  // Helper functions
  //==========================================================

  function fail(message) {
    assert(false, message);
  }

  function power() {
    nes.power();
  }

  function reset() {
    nes.reset();
  }

  function step(count = 1) {
    for (let i = 0; i < count; i++) {
      nes.cpu.step();
    }
  }

  function readByte(address) {
    return nes.cpuMemory.read(address);
  }

  function readString(address) {
    const data = [];
    let value;
    while ((value = readByte(address++)) !== 0) {
      data.push(value);
    }
    return String.fromCharCode.apply(null, data);
  }

  function screenshot(file) {
    const verifiedFile = getPath(file || test.name + '.png');
    const outputFile = getOutputPath(test.name + '.png');
    asyncResults.push(nes.ppu.writeFrameToFile(outputFile).then(() => {
      return new Promise((resolve, reject) => {
        const verifiedBuffer = fs.readFileSync(verifiedFile);
        const outputBuffer = fs.readFileSync(outputFile);
        if (outputBuffer.equals(verifiedBuffer)) {
          resolve();
        } else {
          reject(new Error(`Screenshot ${outputFile} does not match ${verifiedFile}`));
        }
      });
    }));
  }

  function getPath(...names) {
    return path.join(test.dir, ...names);
  }

  function getOutputPath(...names) {
    const dir = 'out';
    mkdirp(getPath(dir));
    return getPath(dir, ...names);
  }

  function blargg() {
    // Test code for all Blargg's test ROMs
    const RESULT_ADDRESS = 0x6000;
    const RESULT_RUNNING = 0x80;
    const RESULT_RESET = 0x81;
    const RESULT_OK = 0x00;
    const MESSAGE_ADDRESS = 0x6004;

    function run() {
      let result;
      while ((result = readByte(RESULT_ADDRESS)) !== RESULT_RUNNING) {
        step(); // Wait until test starts/resumes
      }
      while ((result = readByte(RESULT_ADDRESS)) === RESULT_RUNNING) {
        step(); // Wait until test starts/resumes
      }
      return result;
    }

    let result = run();
    if (result === RESULT_RESET) {
      step(200000); // Reset needs to be done at least after 100 msec (~122880 cpu ticks)
      reset();
      result = run();
    }

    const message = readString(MESSAGE_ADDRESS);
    assert(result === RESULT_OK, '\n' + message);
  }
}
