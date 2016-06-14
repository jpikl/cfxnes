//=============================================================================
// Test:   apu_test
// Source: http://blargg.8bitalley.com/parodius/nes-tests/apu_test.zip
//=============================================================================

import {DisabledPPU} from '../units';

export const dir = './test/roms/apu_test';

export const files = [
  '1-len_ctr.nes',
  '2-len_table.nes',
  '3-irq_flag.nes',
  // '4-jitter.nes',
  '5-len_timing.nes',
  '6-irq_flag_timing.nes',
  // '7-dmc_basics.nes',
  // '8-dmc_rates.nes',
];

export function init() {
  return {ppu: new DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
