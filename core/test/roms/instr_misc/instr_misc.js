//=============================================================================
// Test:   instr_misc
// Source: http://blargg.8bitalley.com/parodius/nes-tests/nes_instr_misc.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledAPU, DisabledPPU } from '../units';

export const dir = './test/roms/instr_misc';

export const files = [
  '01-abs_x_wrap.nes',
  '02-branch_wrap.nes',
  // '03-dummy_reads.nes',
  // '04-dummy_reads_apu.nes',
];

export function configure(config) {
  config.cpuMemory = {class: RAMEnabledCPUMemory};
  config.apu = {class: DisabledAPU};
  config.ppu = {class: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
