import {createOptions} from './utils';

export const AUTO = 'auto';
export const NTSC = 'ntsc';
export const PAL = 'pal';

export const values = [AUTO, NTSC, PAL];

export const labels = {
  [AUTO]: 'Auto-detect',
  [NTSC]: 'NTSC',
  [PAL]: 'PAL',
};

export const options = createOptions(values, labels);

export default values;
