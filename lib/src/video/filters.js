export const NEAREST = 'nearest';
export const LINEAR = 'linear';

export function isFilter(filter) {
  return [NEAREST, LINEAR].indexOf(filter) >= 0;
}
