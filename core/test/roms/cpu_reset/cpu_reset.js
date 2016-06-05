//=============================================================================
// Test:   cpu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/cpu_reset.zip
//=============================================================================

import {DisabledAPU, DisabledPPU} from '../units';

export const dir = './test/roms/cpu_reset';

export const files = [
  'ram_after_reset.nes',
  'registers.nes',
];

export function configure(config) {
  config.apu = {class: DisabledAPU};
  config.ppu = {class: DisabledPPU};
}

export function execute(test) {
  test.blargg();
}
