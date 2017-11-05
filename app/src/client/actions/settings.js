import {log} from '../../common';
import {nes} from '../common';
import {defaultSettings, loadSettings, applySettingsToNes, copySettingsFromNes} from '../settings';

import {
  SET_ACTIVE_SETTINGS_PANEL,
  SET_SETTINGS_VALUES,
  LOCK_SETTINGS_RESET,
  UNLOCK_SETTINGS_RESET,
} from '../actionTypes';

import {createAction, UNLOCK_TIMEOUT} from './utils';

export function setActiveSettingsPanel(id) {
  return createAction(SET_ACTIVE_SETTINGS_PANEL, id);
}

export function resetSettings() {
  return dispatch => {
    applySettingsToNes(nes, defaultSettings);
    dispatch(createAction(LOCK_SETTINGS_RESET));
    dispatch(createAction(SET_SETTINGS_VALUES, defaultSettings));
    setTimeout(() => dispatch(createAction(UNLOCK_SETTINGS_RESET)), UNLOCK_TIMEOUT);
  };
}

export function initSettings() {
  return dispatch => {
    return loadSettings().then(settings => {
      if (settings) {
        applySettingsToNes(nes, settings);
        dispatch(createAction(SET_SETTINGS_VALUES, {
          ...defaultSettings,          // In case some app settings are missing
          ...settings,                 // Copy app settings
          ...copySettingsFromNes(nes), // Copy NES settings
        }));
      }
    }).catch(error => {
      log.error('Failed to load settings', error);
    });
  };
}
