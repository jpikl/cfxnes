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
  config.cpuMemory = {type: 'class', value: RAMEnabledCPUMemory};
  config.ppu = {type: 'class', value: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}