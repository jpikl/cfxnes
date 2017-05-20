//=============================================================================
// Test:   holydiverbatman
// Source: http://pineight.com/nes/holydiverbatman-bin-0.01.7z
//=============================================================================

import {MemoryOutputPPU} from '../units';

export const dir = './test/roms/holydiverbatman';

export const files = [
  'M0_P32K_C8K_V.nes',
  'M1_P128K.nes',
  'M1_P128K_C128K.nes',
  'M1_P128K_C128K_S8K.nes',
  'M1_P128K_C128K_W8K.nes',
  'M1_P128K_C32K.nes',
  'M1_P128K_C32K_S8K.nes',
  'M1_P128K_C32K_W8K.nes',
  'M1_P512K_S32K.nes',
  'M1_P512K_S8K.nes',
  'M2_P128K_V.nes',
  'M3_P32K_C32K_H.nes',
  'M4_P128K.nes',
  'M4_P256K_C256K.nes',
  'M7_P128K.nes',
  'M34_P128K_H.nes',
];

export function init() {
  return {ppu: new MemoryOutputPPU};
}

const steps = [
  50000,   // M0_P32K_C8K_V
  1700000, // M1_P128K
  900000,  // M1_P128K_C128K
  900000,  // M1_P128K_C128K_S8K
  900000,  // M1_P128K_C128K_W8K
  850000,  // M1_P128K_C32K
  850000,  // M1_P128K_C32K_S8K
  850000,  // M1_P128K_C32K_W8K
  4200000, // M1_P512K_S32K
  1700000, // M1_P512K_S8K
  900000,  // M2_P128K_V
  700000,  // M3_P32K_C32K_H
  1700000, // M4_P128K
  950000,  // M4_P256K_C256K
  900000,  // M7_P128K
  900000,  // M34_P128K_H
];

export function execute(test) {
  test.step(steps[test.number]);
  test.screenshot();
}
