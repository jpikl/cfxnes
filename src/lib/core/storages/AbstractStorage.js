import { stringToData, dataToString, stringToObject, objectToString } from '../utils/convert';

//=========================================================
// Base class of storages
//=========================================================

export default class AbstractStorage {

  readString(key) {
    return this.read(key).then(value => {
      return Promise.resolve(value || null);
    });
  }

  writeString(key, value) {
    return this.write(key, value);
  }

  readData(key, output) {
    return this.read(key).then(value => {
      return Promise.resolve(value != null ? stringToData(value, output) : null);
    });
  }

  writeData(key, value) {
    return new Promise((resolve, reject) => {
      this.write(key, dataToString(value)).then(resolve, reject);
    });
  }

  readObject(key) {
    return this.read(key).then(value => {
      return Promise.resolve(value != null ? stringToObject(value) : null);
    });
  }

  writeObject(key, value) {
    return new Promise((resolve, reject) => {
      this.write(key, objectToString(value)).then(resolve, reject);
    });
  }

}
