//=============================================================================
// Test:   oam_read
// Source: http://blargg.8bitalley.com/parodius/nes-tests/oam_read.zip
//=============================================================================

import {DisabledApu, NoOutputPpu} from '../units';

export const dir = './test/roms/oam_read';
export const file = 'oam_read.nes';

export function init() {
  return {apu: new DisabledApu, ppu: new NoOutputPpu};
}

export function execute(test) {
  test.blargg();
}
