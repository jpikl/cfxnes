import AbstractStorage from './AbstractStorage';

//=========================================================
// Memory storage
//=========================================================

export default class MemoryStorage extends AbstractStorage {

  constructor() {
    super();
    this.data = {};
  }

  read(key) {
    return new Promise((resolve, reject) => {
      resolve(this.data[key]);
    });
  }

  write(key, value) {
    return new Promise((resolve, reject) => {
      this.data[key] = value;
      resolve();
    });
  }

}
