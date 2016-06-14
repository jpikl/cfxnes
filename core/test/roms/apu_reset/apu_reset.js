//=============================================================================
// Test:   apu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/apu_reset.zip
//=============================================================================

import {DisabledPPU} from '../units';

export const dir = './test/roms/apu_reset';

export const files = [
  '4015_cleared.nes',
  // '4017_timing.nes',
  // '4017_written.nes',
  // 'irq_flag_cleared.nes',
  'len_ctrs_enabled.nes',
  // 'works_immediately.nes',
];

export function init() {
  return {ppu: new DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
