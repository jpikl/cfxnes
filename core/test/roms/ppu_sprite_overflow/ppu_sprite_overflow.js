//=============================================================================
// Test:   ppu_sprite_overflow
// Source: http://blargg.8bitalley.com/parodius/nes-tests/ppu_sprite_overflow.zip
//=============================================================================

import {NoOutputPPU, DisabledAPU} from '../units';

export const dir = './test/roms/ppu_sprite_overflow';

export const files = [
  '01-basics.nes',
  '02-details.nes',
  // '03-timing.nes',
  // '04-obscure.nes',
  '05-emulator.nes',
];

export function configure(config) {
  config.ppu = {class: NoOutputPPU};
  config.apu = {class: DisabledAPU};
}

export function execute(test) {
  test.blargg();
}
