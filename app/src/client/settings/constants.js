import {nes} from '../common';
import {Theme} from '../enums';
import {copySettingsFromNes} from './settings';

export const defaultSettings = {
  theme: Theme.LIGHT,
  fpsVisible: true,
  controlsVisible: true,
  ...copySettingsFromNes(nes),
};

export const audioSupported = nes.audio != null;
