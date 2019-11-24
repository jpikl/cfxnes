import {describe} from './utils';

/**
 * Mirroring of PPU nametables.
 * @enum {string}
 */
const Mirroring = {
  /** Mirror nametable 0 in all areas. */
  SCREEN_0: 'S0',
  /** Mirror nametable 1 in all areas. */
  SCREEN_1: 'S1',
  /** Mirror nametable 2 in all areas. */
  SCREEN_2: 'S2',
  /** Mirror nametable 3 in all areas. */
  SCREEN_3: 'S3',
  /** Mirror nametable 0 in screens 0, 1 and nametable 1 in areas 2, 3.  */
  HORIZONTAL: 'H',
  /** Mirror nametable 0 in screens 0, 2 and nametable 1 in areas 1, 3.  */
  VERTICAL: 'V',
  /** Each area has it own nametable */
  FOUR_SCREEN: '4S',
};

/**
 * Array of single-screen mirrorings.
 * @type {Array<Mirroring>}
 */
const singleMirrorings = [
  Mirroring.SCREEN_0,
  Mirroring.SCREEN_1,
  Mirroring.SCREEN_2,
  Mirroring.SCREEN_3,
];

/**
 * Returns single-screen mirroring.
 * @param {number} area Area number (0-3);
 * @returns {Mirroring} Mirroring.
 */
Mirroring.getSingle = area => {
  return singleMirrorings[area];
};

/**
 * Mirrored area numbers.
 * @type {!Object<Mirroring, !Array<number>>}
 */
const mirroringAreas = {
  [Mirroring.SCREEN_0]: [0, 0, 0, 0],
  [Mirroring.SCREEN_1]: [1, 1, 1, 1],
  [Mirroring.SCREEN_2]: [2, 2, 2, 2],
  [Mirroring.SCREEN_3]: [3, 3, 3, 3],
  [Mirroring.HORIZONTAL]: [0, 0, 1, 1],
  [Mirroring.VERTICAL]: [0, 1, 0, 1],
  [Mirroring.FOUR_SCREEN]: [0, 1, 2, 3],
};

/**
 * Returns mirrored area numbers.
 * @param {Mirroring} mirroring Mirroring.
 * @returns {!Array<number>} Area numbers.
 */
Mirroring.getAreas = mirroring => {
  const areas = mirroringAreas[mirroring];
  if (areas) {
    return areas;
  }
  throw new Error('Invalid mirroring: ' + describe(mirroring));
};

export default Mirroring;
