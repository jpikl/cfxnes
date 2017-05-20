//=============================================================================
// Test:   ppu_tests
// Source: http://www.slack.net/~ant/nes-tests/blargg_ppu_tests.zip
//=============================================================================

import {MemoryOutputPPU} from '../units';

export const dir = './test/roms/ppu_tests';

export const files = [
  'palette_ram.nes',
  'power_up_palette.nes',
  'sprite_ram.nes',
  'vbl_clear_time.nes',
  'vram_access.nes',
];

export function init() {
  return {ppu: new MemoryOutputPPU};
}

export function execute(test) {
  test.step(test.number === 3 ? 230000 : 180000);
  test.screenshot('success.png');
}
