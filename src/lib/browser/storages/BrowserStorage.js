import { copyArray } from '../../core/utils/arrays';
import { dataToString, stringToData, objectToString, stringToObject } from '../../core/utils/convert';
import logger from '../../core/utils/logger';

const CONFIG_KEY = 'CFxNES.config';

//=========================================================
// Browser storage
//=========================================================

export default class BrowserStorage {

  readConfiguration() {
    return new Promise(resolve => {
      var value = localStorage.getItem(CONFIG_KEY);
      resolve(value ? stringToObject(value) : null);
    });
  }

  writeConfiguration(config) {
    return new Promise(resolve => {
      localStorage.setItem(CONFIG_KEY, objectToString(config));
      resolve();
    });
  }

  deleteConfiguration() {
    return new Promise(resolve => {
      localStorage.removeItem(CONFIG_KEY);
      resolve();
    });
  }

  readRAM(id, type, buffer) {
    return this.getDB().then(db => {
      return new Promise((resolve, reject) => {
        var transaction = db.transaction('ram', 'readonly');
        var store = transaction.objectStore('ram');
        var request = store.get(id);
        request.onsuccess = () => {
          var data = request.result && request.result[type];
          resolve(data ? copyArray(data, buffer) : null);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  writeRAM(id, type, data) {
    return this.getDB().then(db => {
      return new Promise((resolve, reject) => {
        var transaction = db.transaction('ram', 'readwrite');
        var store = transaction.objectStore('ram');
        var readRequest = store.get(id);
        readRequest.onsuccess = () => {
          var ram = readRequest.result;
          if (!ram) ram = {id};
          // fake-indexeddb implementation of structured clone algorithm
          // does not support typed arrays, so we have to convert them
          // to common JS arrays
          ram[type] = indexedDB.fake ? copyArray(data) : data;
          var writeRequest = store.put(ram);
          writeRequest.onsuccess = () => resolve();
          writeRequest.onerror = () => reject(writeRequest.error);
        };
        readRequest.onerror = () => reject(readRequest.error);
      });
    });
  }

  deleteRAM(id) {
    return this.getDB().then(db => {
      return new Promise((resolve, reject) => {
        var transaction = db.transaction('ram', 'readwrite');
        var store = transaction.objectStore('ram');
        var request = id != null ? store.delete(id) : store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        logger.info('Opening IndexedDB database');
        var request = indexedDB.open('CFxNES', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('IndexedDB database is blocked and cannot be upgraded.'));
        request.onupgradeneeded = event => {
          logger.info(`Upgrading IndexedDB database from version ${event.oldVersion} to ${event.newVersion}`);
          request.result.createObjectStore('ram', {keyPath: 'id'});
        };
      });
    }
    return this.dbPromise;
  }

}
