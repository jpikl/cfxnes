//=============================================================================
// Test:   bntest
// Source: http://pics.pineight.com/nes/bntest.zip
//=============================================================================

import {BufferedOutputPPU} from '../units';

export const dir = './test/roms/bntest';

export const files = [
  'bntest_aorom.nes',
  'bntest_h.nes',
  'bntest_v.nes',
];

export function configure(config) {
  config.ppu = {class: BufferedOutputPPU};
}

export function execute(test) {
  test.step(50000);
  test.screenshot();
}
