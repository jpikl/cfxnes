import {Joypad, Zapper} from '../../../../core';
import JoypadAdapter from './JoypadAdapter';
import ZapperAdapter, {ZAPPER_BEAM, ZAPPER_TRIGGER} from './ZapperAdapter';

export const JOYPAD = 'joypad';
export const ZAPPER = 'zapper';

export {ZAPPER_BEAM, ZAPPER_TRIGGER};

const devices = {
  [JOYPAD]: {Device: Joypad, Adapter: JoypadAdapter},
  [ZAPPER]: {Device: Zapper, Adapter: ZapperAdapter},
};

export default devices;

export function isDevice(device) {
  return device in devices;
}
