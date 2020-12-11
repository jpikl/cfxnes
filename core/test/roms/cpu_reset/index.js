//=============================================================================
// Test:   cpu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/cpu_reset.zip
//=============================================================================

import {DisabledApu, DisabledPpu} from '../units';

export const dir = './test/roms/cpu_reset';

export const files = [
  'ram_after_reset.nes',
  'registers.nes',
];

export function init() {
  return {apu: new DisabledApu, ppu: new DisabledPpu};
}

export function execute(test) {
  test.blargg();
}
