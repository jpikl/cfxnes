import describeValue from './describeValue';

/**
 * NES region.
 * @enum {string}
 */
const Region = {
  /** NTSC region (North America). */
  NTSC: 'NTSC',
  /** PAL region (Europe). */
  PAL: 'PAL',
};

/**
 * Parameters of NES region.
 * - framesPerSecond - Screen refresh rate (Hz).
 * - cpuFrequency - CPU frequency (Hz).
 * - ppuClipTopBottom - Whether to clip 8 top/bottom pixels of PPU output.
 * - frameCounterMax4 - Reset values for APU 4-step frame counter.
 * - frameCounterMax5 - Reset values for APU 5-step frame counter.
 * - noiseTimerPeriods - Timer periods of APU noise channel.
 * - dmcTimerPeriods - Timer periods of APU DM channel.
 * @typedef {{
 *   framesPerSecond: number,
 *   cpuFrequency: number,
 *   ppuClipTopBottom: boolean,
 *   frameCounterMax4: !Array<number>,
 *   frameCounterMax5: !Array<number>,
 *   noiseTimerPeriods: !Array<number>,
 *   dmcTimerPeriods: !Array<number>,
 * }}
 */
let RegionParams;

/**
 * Parameters of NTSC region.
 * @type {RegionParams}
 */
const ntscParams = {
  framesPerSecond: 60,
  cpuFrequency: 1789773,
  ppuClipTopBottom: true,
  frameCounterMax4: [7457, 7456, 7458, 7457, 1, 1],
  frameCounterMax5: [7457, 7456, 7458, 7458, 7452, 1],
  noiseTimerPeriods: [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068],
  dmcTimerPeriods: [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54],
};

/**
 * Parameters of PAL region.
 * @type {RegionParams}
 */
const palParams = {
  framesPerSecond: 50,
  cpuFrequency: 1789773 * 5 / 6, // NTSC frequency adjusted to the 50 Hz screen refresh rate (the real CPU frequency for PAL is 1662607 Hz)
  ppuClipTopBottom: false,
  frameCounterMax4: [8313, 8314, 8312, 8313, 1, 1],
  frameCounterMax5: [8313, 8314, 8312, 8314, 8312, 1],
  noiseTimerPeriods: [4, 8, 14, 30, 60, 88, 118, 148, 188, 236, 354, 472, 708, 944, 1890, 3778],
  dmcTimerPeriods: [398, 354, 316, 298, 276, 236, 210, 198, 176, 148, 132, 118, 98, 78, 66, 50],
};

/**
 * Return region parameters.
 * @param {Region} region Region.
 * @return {RegionParams} Parameters.
 */
Region.getParams = region => {
  switch (region) {
    case Region.NTSC: return ntscParams;
    case Region.PAL: return palParams;
    default: throw new Error('Invalid region: ' + describeValue(region));
  }
};

export default Region;
