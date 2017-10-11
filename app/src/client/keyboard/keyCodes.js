export const TAB = 9;
export const CTRL = 17;
export const ESC = 27;
export const SPACE = 32;
export const L = 76;
export const M = 77;
export const O = 79;
export const P = 80;
export const Q = 81;
export const W = 87;
export const PLUS = 107;
export const MINUS = 109;

const names = {
  [TAB]: 'Tab',
  [CTRL]: 'Ctrl',
  [ESC]: 'Esc',
  [SPACE]: 'Space',
  [L]: 'L',
  [M]: 'M',
  [O]: 'O',
  [P]: 'P',
  [Q]: 'Q',
  [W]: 'W',
  [PLUS]: '+',
  [MINUS]: '-',
};

export function getName(keyCode) {
  return names[keyCode];
}
