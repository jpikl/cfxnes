import {createOptions} from './utils';

export const CANVAS = 'canvas';
export const WEBGL = 'webgl';

export const values = [WEBGL, CANVAS];

export const labels = {
  [CANVAS]: 'Canvas 2D',
  [WEBGL]: 'WebGL',
};

export const options = createOptions(values, labels);

export default values;
