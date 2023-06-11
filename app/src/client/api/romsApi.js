import {fetchJson} from './utils';

const BASE_URL = 'api/roms';

export function getAll() {
  return fetchJson(__STATIC_BUILD__ ? "roms/data.json" : "api/roms/");
}

export function getOne(romId) {
  if (__STATIC_BUILD__) {
    return getAll().then(roms => {
      const rom = roms.find(rom => rom.id === romId);
      if (!rom) {
        throw new Error("Could not find ROM!");
      }
      return rom;
    });
  }
  return fetchJson(`api/roms/${romId}`);
}
