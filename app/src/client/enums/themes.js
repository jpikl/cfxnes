export const LIGHT = 'light';
export const DARK = 'dark';

export const values = [LIGHT, DARK];

export const labels = {
  [LIGHT]: 'Light',
  [DARK]: 'Dark',
};

export const icons = {
  [LIGHT]: 'sun-o ',
  [DARK]: 'moon-o',
};

export function getLabel(theme) {
  return labels[theme] + ' theme';
}

export function getIcon(theme) {
  return icons[theme];
}

export function getNext(theme) {
  return values[(values.indexOf(theme) + 1) % values.length];
}

export default values;
