import {describe} from './utils';

export const NTSC = 'NTSC';
export const PAL = 'PAL';

const ntscParams = {
  framesPerSecond: 60,
  cpuFrequency: 1789773,
  ppuClipTopBottom: true,
  frameCounterMax4: [7457, 7456, 7458, 7457, 1, 1], // 4-step frame counter
  frameCounterMax5: [7457, 7456, 7458, 7458, 7452, 1], // 5-step frame counter
  noiseChannelTimerPeriods: [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068],
  dmcChannelTimerPeriods: [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54],
};

const palParams = {
  framesPerSecond: 50,
  cpuFrequency: 1789773 * 5 / 6, // NTSC frequency adjusted to the 50 Hz screen refresh rate (the real CPU frequency for PAL is 1662607 Hz)
  ppuClipTopBottom: false,
  frameCounterMax4: [8313, 8314, 8312, 8313, 1, 1], // 4-step frame counter
  frameCounterMax5: [8313, 8314, 8312, 8314, 8312, 1], // 5-step frame counter
  noiseChannelTimerPeriods: [4, 8, 14, 30, 60, 88, 118, 148, 188, 236, 354, 472, 708, 944, 1890, 3778],
  dmcChannelTimerPeriods: [398, 354, 316, 298, 276, 236, 210, 198, 176, 148, 132, 118, 98, 78, 66, 50],
};

export function getParams(region) {
  switch (region) {
    case NTSC: return ntscParams;
    case PAL: return palParams;
    default: throw new Error('Invalid region: ' + describe(region));
  }
}
