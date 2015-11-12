//=============================================================================
// Test:   instr_timing
// Source: http://blargg.8bitalley.com/parodius/nes-tests/instr_timing.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledPPU } from '../units';

export const dir = './test/roms/instr_timing';

export const files = [
  '1-instr_timing.nes',
  '2-branch_timing.nes',
];

export function configure(config) {
  config.cpuMemory = {class: RAMEnabledCPUMemory};
  config.ppu = {class: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
