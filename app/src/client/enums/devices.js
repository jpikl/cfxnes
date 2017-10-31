import {capitalize} from '../common';
import {createOptions} from './utils';

export const NONE = 'none';
export const JOYPAD = 'joypad';
export const ZAPPER = 'zapper';

export const values = [NONE, JOYPAD, ZAPPER];

export const labels = {
  [NONE]: 'No device',
  [JOYPAD]: 'Controller',
  [ZAPPER]: 'Zapper',
};

export const inputNames = {
  [NONE]: [],
  [JOYPAD]: ['a', 'b', 'start', 'select', 'left', 'right', 'up', 'down'],
  [ZAPPER]: ['trigger'],
};

export const options = createOptions(values, labels);

export function fromOptional(device) {
  return device != null ? device : NONE;
}

export function toOptional(device) {
  return device !== NONE ? device : null;
}

export function getLabel(device) {
  return labels[device];
}

export function getInputNames(device) {
  return inputNames[device];
}

export function getInputId({port, device, name}) {
  return `${port}.${device}.${name}`;
}

export function getInputLabel({name}) {
  return capitalize(name);
}

export default values;
