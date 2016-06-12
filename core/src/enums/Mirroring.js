export const SINGLE_SCREEN_0 = getSingleScreen(0);
export const SINGLE_SCREEN_1 = getSingleScreen(1);
export const SINGLE_SCREEN_2 = getSingleScreen(2);
export const SINGLE_SCREEN_3 = getSingleScreen(3);
export const HORIZONTAL = 'HOR';
export const VERTICAL = 'VER';
export const FOUR_SCREEN = 'FS';

//                                                 A | B
// Alignment of nametables [A, B, C, D] on screen  --+--
//                                                 C | D
//

const areas = {
  [SINGLE_SCREEN_0]: [0, 0, 0, 0],
  [SINGLE_SCREEN_1]: [1, 1, 1, 1],
  [SINGLE_SCREEN_2]: [2, 2, 2, 2],
  [SINGLE_SCREEN_3]: [3, 3, 3, 3],
  [HORIZONTAL]: [0, 0, 1, 1],
  [VERTICAL]: [0, 1, 0, 1],
  [FOUR_SCREEN]: [0, 1, 2, 3],
};

export function getAreas(mirroring) {
  return areas[mirroring];
}

export function getSingleScreen(area) {
  return 'SS' + area;
}
