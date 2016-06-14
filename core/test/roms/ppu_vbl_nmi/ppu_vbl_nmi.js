//=============================================================================
// Test:   ppu_vbl_nmi
// Source: http://blargg.8bitalley.com/parodius/nes-tests/ppu_vbl_nmi.zip
//=============================================================================

import {DisabledAPU, NoOutputPPU} from '../units';

export const dir = './test/roms/ppu_vbl_nmi';

export const files = [
  '01-vbl_basics.nes',
  '02-vbl_set_time.nes',
  '03-vbl_clear_time.nes',
  '04-nmi_control.nes',
  '05-nmi_timing.nes',
  '06-suppression.nes',
  '07-nmi_on_timing.nes',
  '08-nmi_off_timing.nes',
  '09-even_odd_frames.nes',
  '10-even_odd_timing.nes',
];

export function init() {
  return {apu: new DisabledAPU, ppu: new NoOutputPPU};
}

export function execute(test) {
  test.blargg();
}
