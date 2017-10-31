import {fetchJson} from './utils';

const BASE_URL = '/api/roms';

export function getAll() {
  return fetchJson(`${BASE_URL}/`);
}

export function getOne(romId) {
  return fetchJson(`${BASE_URL}/${romId}`);
}
