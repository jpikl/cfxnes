//=============================================================================
// Test:   mmc3_test
// Source: http://blargg.8bitalley.com/parodius/nes-tests/mmc3_test_2.zip
//=============================================================================

import { DisabledAPU, NoOutputPPU } from '../units';

export const names = [
  'mmc3_test (1-clocking)',
  'mmc3_test (2-details)',
  'mmc3_test (3-A12_clocking)',
  // 'mmc3_test (4-scanline_timing)',
  'mmc3_test (5-MMC3)',
  // 'mmc3_test (6-MMC3_alt)',
];

export const files = [
  './test/roms/mmc3_test/1-clocking.nes',
  './test/roms/mmc3_test/2-details.nes',
  './test/roms/mmc3_test/3-A12_clocking.nes',
  // './test/roms/mmc3_test/4-scanline_timing.nes',
  './test/roms/mmc3_test/5-MMC3.nes',
  // './test/roms/mmc3_test/6-MMC3_alt.nes',
];

export function configure(config) {
  config.apu = {type: 'class', value: DisabledAPU};
  config.ppu = {type: 'class', value: NoOutputPPU};
}

export function execute(test) {
  test.blargg();
}
