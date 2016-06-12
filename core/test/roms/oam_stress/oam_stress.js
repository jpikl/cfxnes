//=============================================================================
// Test:   oam_stress
// Source: http://blargg.8bitalley.com/parodius/nes-tests/oam_stress.zip
//=============================================================================

import {DisabledAPU, NoOutputPPU} from '../units';

export const dir = './test/roms/oam_stress';
export const file = 'oam_stress.nes';

export function mock(units) {
  units.apu = new DisabledAPU;
  units.ppu = new NoOutputPPU;
}

export function execute(test) {
  test.blargg();
}
