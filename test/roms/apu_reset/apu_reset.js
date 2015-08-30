//=============================================================================
// Test:   apu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/apu_reset.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledPPU } from '../units';

export const names = [
  'apu_reset (4015_cleared)',
  // 'apu_reset (4017_timing)',
  // 'apu_reset (4017_written)',
  // 'apu_reset (irq_flag_cleared)',
  'apu_reset (len_ctrs_enabled)',
  // 'apu_reset (works_immediately)',
];

export const files = [
  './test/roms/apu_reset/4015_cleared.nes',
  // './test/roms/apu_reset/4017_timing.nes',
  // './test/roms/apu_reset/4017_written.nes',
  // './test/roms/apu_reset/irq_flag_cleared.nes',
  './test/roms/apu_reset/len_ctrs_enabled.nes',
  // './test/roms/apu_reset/works_immediately.nes',
];

export function configure(config) {
  config.cpuMemory = {type: 'class', value: RAMEnabledCPUMemory};
  config.ppu = {type: 'class', value: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
