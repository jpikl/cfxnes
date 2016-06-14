//=============================================================================
// Test:   oam_read
// Source: http://blargg.8bitalley.com/parodius/nes-tests/oam_read.zip
//=============================================================================

import {DisabledAPU, NoOutputPPU} from '../units';

export const dir = './test/roms/oam_read';
export const file = 'oam_read.nes';

export function init() {
  return {apu: new DisabledAPU, ppu: new NoOutputPPU};
}

export function execute(test) {
  test.blargg();
}
