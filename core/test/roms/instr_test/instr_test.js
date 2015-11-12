//=============================================================================
// Test:   instr_test
// Source: http://blargg.8bitalley.com/nes-tests/instr_test-v4.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledAPU, DisabledPPU } from '../units';

export const dir = './test/roms/instr_test';

export const files = [
  '01-basics.nes',
  '02-implied.nes',
  '03-immediate.nes',
  '04-zero_page.nes',
  '05-zp_xy.nes',
  '06-absolute.nes',
  '07-abs_xy.nes',
  '08-ind_x.nes',
  '09-ind_y.nes',
  '10-branches.nes',
  '11-stack.nes',
  '12-jmp_jsr.nes',
  '13-rts.nes',
  '14-rti.nes',
  '15-brk.nes',
  '16-special.nes',
];

export function configure(config) {
  config.cpuMemory = {class: RAMEnabledCPUMemory};
  config.apu = {class: DisabledAPU};
  config.ppu = {class: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
