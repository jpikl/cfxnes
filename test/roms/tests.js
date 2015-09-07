// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

//=============================================================================
// Collection of ROM-based tests
// Source: http://wiki.nesdev.com/w/index.php/Emulator_tests
//=============================================================================

import chai from 'chai';
import fs from 'fs';
import path from 'path';
import * as nestest from './nestest/nestest';
import * as instr_test from './instr_test/instr_test';
import * as instr_timing from './instr_timing/instr_timing';
import * as instr_misc from './instr_misc/instr_misc';
import * as cpu_reset from './cpu_reset/cpu_reset';
import * as ppu_tests from './ppu_tests/ppu_tests';
import * as ppu_vbl_nmi from './ppu_vbl_nmi/ppu_vbl_nmi';
import * as apu_reset from './apu_reset/apu_reset';
import * as apu_test from './apu_test/apu_test';
import * as mmc3_test from './mmc3_test/mmc3_test';
import * as bntest from './bntest/bntest';
import coreConfig from '../../src/lib/core/config';
import Injector from '../../src/lib/core/utils/Injector';
import { dataToString } from '../../src/lib/core/utils/convert';
import { copyProperties } from '../../src/lib/core/utils/objects';

describe('Validation ROMs', () => {
  validate(nestest);
  validate(instr_test);
  validate(instr_timing);
  validate(instr_misc); // 2 failing tests (disabled)
  validate(cpu_reset);
  validate(ppu_tests);
  validate(ppu_vbl_nmi);
  validate(apu_reset); // 4 failing tests (disabled)
  validate(apu_test); // 3 failing tests (disabled)
  validate(mmc3_test); // 2 failing tests (disabled)
  validate(bntest); // 2 failing tests (disabled)
});

function validate(test) {
  var name = path.basename(test.dir);
  var getPath = (file) => path.join(test.dir, file);
  if (test.file) {
    it(name, () => execute(test, test.file, getPath))
  } else if (test.files) {
    for (let file of test.files) {
      var subName = `${name} (${path.basename(file, '.nes')})`;
      it(subName, () => execute(test, file, getPath));
    }
  }
}

function execute(test, file, getPath) {
  var config = copyProperties(coreConfig);

  test.configure(config);

  var injector = new Injector(config);
  var cartridgeFactory = injector.get('cartridgeFactory');
  var cartridge = cartridgeFactory.fromLocalFile(getPath(file));
  var nes = injector.get('nes');

  nes.insertCartridge(cartridge);

  var cpuMemory = injector.get('cpuMemory');
  var ppu = injector.get('ppu');
  var asyncResults = [];

  test.execute({
    assert: chai.assert,
    expect: chai.expect,

    fail(message) {
      this.assert(false, message);
    },

    get(dependency) {
      return injector.get(dependency);
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
      return fs.readFileSync(getPath(file), 'utf8');
    },

    screenshot(origFile, testFile) {
      var name = path.basename(file, '.nes');
      var origFile = origFile || name + '_orig.png';
      var testFile = testFile || name + '.png';
      asyncResults.push(ppu.writeFrameToFile(getPath(testFile)).then(() => {
        return new Promise((resolve, reject) => {
          var origBuffer = fs.readFileSync(getPath(origFile));
          var testBuffer = fs.readFileSync(getPath(testFile));
          if (testBuffer.equals(origBuffer)) {
            resolve();
          } else {
            reject(new Error(`Screenshot ${testFile} does not match ${origFile}.`))
          }
        });
      }));
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
        this.step(200000); // Reset needs to be done at least after 100 msec (~122880 cpu ticks)
        this.reset();
        while ((result = this.readByte(RESULT_ADDRESS)) !== RESULT_RUNNING) {
          this.step(); // Wait until test resumes
        }
        while ((result = this.readByte(RESULT_ADDRESS)) === RESULT_RUNNING) {
          this.step(); // Wait while test is in progress
        }
      }

      var message = this.readString(MESSAGE_ADDRESS);
      this.assert(result === RESULT_OK, '\n' + message);
    },
  });

  if (asyncResults.length) {
    return Promise.all(asyncResults);
  }
}
