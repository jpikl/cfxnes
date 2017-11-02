import {describe} from './utils';

export const SCREEN_0 = 'S0';
export const SCREEN_1 = 'S1';
export const SCREEN_2 = 'S2';
export const SCREEN_3 = 'S3';
export const HORIZONTAL = 'H';
export const VERTICAL = 'V';
export const FOUR_SCREEN = '4S';

const areas = {
  [SCREEN_0]: [0, 0, 0, 0],
  [SCREEN_1]: [1, 1, 1, 1],
  [SCREEN_2]: [2, 2, 2, 2],
  [SCREEN_3]: [3, 3, 3, 3],
  [HORIZONTAL]: [0, 0, 1, 1],
  [VERTICAL]: [0, 1, 0, 1],
  [FOUR_SCREEN]: [0, 1, 2, 3],
};

export function getAreas(mirroring) {
  const area = areas[mirroring];
  if (area) {
    return area;
  }
  throw new Error('Invalid mirroring: ' + describe(mirroring));
}

export function getSingle(screen) {
  return 'S' + screen;
}
