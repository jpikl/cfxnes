import {toString} from './utils';

const SINGLE_SCREEN_0 = 'SS0';
const SINGLE_SCREEN_1 = 'SS1';
const SINGLE_SCREEN_2 = 'SS2';
const SINGLE_SCREEN_3 = 'SS3';
const HORIZONTAL = 'HOR';
const VERTICAL = 'VER';
const FOUR_SCREEN = 'FS';

const areas = {
  [SINGLE_SCREEN_0]: [0, 0, 0, 0],
  [SINGLE_SCREEN_1]: [1, 1, 1, 1],
  [SINGLE_SCREEN_2]: [2, 2, 2, 2],
  [SINGLE_SCREEN_3]: [3, 3, 3, 3],
  [HORIZONTAL]: [0, 0, 1, 1],
  [VERTICAL]: [0, 1, 0, 1],
  [FOUR_SCREEN]: [0, 1, 2, 3],
};

function getAreas(mirroring) {
  const area = areas[mirroring];
  if (area) {
    return area;
  }
  throw new Error('Invalid mirroring: ' + toString(mirroring));
}

function getSingleScreen(index) {
  return 'SS' + index;
}

export default {
  SINGLE_SCREEN_0, SINGLE_SCREEN_1,
  SINGLE_SCREEN_2, SINGLE_SCREEN_3,
  HORIZONTAL, VERTICAL, FOUR_SCREEN,
  getAreas, getSingleScreen,
};
