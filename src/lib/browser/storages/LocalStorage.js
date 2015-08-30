import AbstractStorage from '../../core/storages/AbstractStorage';

//=========================================================
// Local storage
//=========================================================

const KEY_PREFIX = 'CFxNES/';

export default class LocalStorage extends AbstractStorage {

  read(key) {
    return new Promise((resolve, reject) => {
      resolve(window.localStorage[KEY_PREFIX + key]);
    });
  }

  write(key, value) {
    return new Promise((resolve, reject) => {
      window.localStorage[KEY_PREFIX + key] = value;
      resolve();
    });

  }

}
