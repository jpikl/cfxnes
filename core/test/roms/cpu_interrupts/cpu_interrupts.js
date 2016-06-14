//=============================================================================
// Test:   cpu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/cpu_interrupts_v2.zip
//=============================================================================

import {NoOutputPPU} from '../units';

export const dir = './test/roms/cpu_interrupts';

export const files = [
  '1-cli_latency.nes',
  // '2-nmi_and_brk.nes',
  // '3-nmi_and_irq.nes',
  // '4-irq_and_dma.nes',
  // '5-branch_delays_irq.nes',
];

export function init() {
  return {ppu: new NoOutputPPU};
}

export function execute(test) {
  test.blargg();
}
