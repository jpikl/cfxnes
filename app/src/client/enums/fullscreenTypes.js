import {createOptions} from './utils';

export const MAXIMIZED = 'maximized';
export const NORMALIZED = 'normalized';
export const STRETCHED = 'stretched';

export const values = [MAXIMIZED, NORMALIZED, STRETCHED];

export const labels = {
  [MAXIMIZED]: 'Upscale to maximum resolution',
  [NORMALIZED]: 'Upscale without visual artifacts',
  [STRETCHED]: 'Stretch to fill the whole screen',
};

export const options = createOptions(values, labels);

export default values;
