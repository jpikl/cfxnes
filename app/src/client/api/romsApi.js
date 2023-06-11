import {fetchJson} from './utils';

export function getAll() {
  return fetchJson(__STATIC_SITE__ ? 'roms/data.json' : 'api/roms/');
}

export function getOne(romId) {
  if (__STATIC_SITE__) {
    return getAll().then(roms => {
      const rom = roms.find(item => item.id === romId);
      if (!rom) {
        throw new Error(`ROM ${romId} not found.`);
      }
      return rom;
    });
  }
  return fetchJson(`api/roms/${romId}`);
}
