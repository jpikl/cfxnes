import {SystemSettings, SYSTEM} from './system';
import {VideoSettings, VIDEO} from './video';
import {AudioSettings, AUDIO} from './audio';
import {ControlsSettings, CONTROLS} from './controls';
import {ResetSettings, RESET} from './reset';

export const panelIds = [SYSTEM, VIDEO, AUDIO, CONTROLS, RESET];
export const isValidPanelId = id => panelIds.indexOf(id) >= 0;
export const defaultPanelId = panelIds[0];

export const panels = {
  [SYSTEM]: SystemSettings,
  [VIDEO]: VideoSettings,
  [AUDIO]: AudioSettings,
  [CONTROLS]: ControlsSettings,
  [RESET]: ResetSettings,
};
