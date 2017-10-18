import {log} from '../common';
import {nes} from './common';
import {nvramStore} from './database';

export function loadNVRAM() {
  if (nes.nvram) {
    return nvramStore.get(nes.rom.sha1)
      .then(data => data && nes.nvram.set(data))
      .catch(error => log.error('Failed to load NVRAM', error));
  }
  return Promise.resolve();
}

export function saveNVRAM() {
  if (nes.nvram) {
    return nvramStore.put(nes.rom.sha1, nes.nvram)
      .catch(error => log.error('Failed to save NVRAM', error));
  }
  return Promise.resolve();
}
