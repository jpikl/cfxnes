//=============================================================================
// Test:   ppu_sprite_hit
// Source: http://blargg.8bitalley.com/parodius/nes-tests/ppu_sprite_hit.zip
//=============================================================================

import {DisabledAPU, NoOutputPPU} from '../units';

export const dir = './test/roms/ppu_sprite_hit';

export const files = [
  '01-basics.nes',
  '02-alignment.nes',
  '03-corners.nes',
  '04-flip.nes',
  '05-left_clip.nes',
  '06-right_edge.nes',
  '07-screen_bottom.nes',
  '08-double_height.nes',
  // '09-timing.nes',
  '10-timing_order.nes',
];

export function init() {
  return {apu: new DisabledAPU, ppu: new NoOutputPPU};
}

export function execute(test) {
  test.blargg();
}
