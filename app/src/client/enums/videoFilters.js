import {createOptions} from './common';

export const NEAREST = 'nearest';
export const LINEAR = 'linear';

export const values = [NEAREST, LINEAR];

export const labels = {
  [NEAREST]: 'Pixelated',
  [LINEAR]: 'Linear',
};

export const options = createOptions(values, labels);

export default values;
