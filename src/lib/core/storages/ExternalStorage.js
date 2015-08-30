import AbstractStorage from './AbstractStorage';

//=========================================================
// External storage
//=========================================================

export default class ExternalStorage extends AbstractStorage {

  constructor(callback) {
    super();
    this.callback = callback;
  }

  read(key) {
    return this.callback['read'](key); // jscs:ignore requireDotNotation
  }

  write(key, value) {
    return this.callback['write'](key, value); // jscs:ignore requireDotNotation
  }

}
