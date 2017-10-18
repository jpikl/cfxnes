import {debounce, log} from '../../common';

const STORAGE_KEY = 'settings';
const SAVE_TIMEOUT = 1000;

let settingsToSave;

const saveSettingsLater = debounce(() => {
  log.info('Saving settings');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
}, SAVE_TIMEOUT);

export function saveSettings(settings) {
  if (settingsToSave !== settings) {
    settingsToSave = settings;
    saveSettingsLater();
  }
}

export function loadSettings() {
  return new Promise(resolve => {
    log.info('Loading settings');
    resolve(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  });
}
