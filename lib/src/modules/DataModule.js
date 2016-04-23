import logger from '../../../core/src/utils/logger';
import {objectToString, stringToObject} from '../../../core/src/utils/convert';
import {formatSize} from '../../../core/src/utils/format';

const DB_NAME = 'CFxNES.db';
const DB_VERSION = 1;
const OPTIONS_KEY = 'CFxNES.options';
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

//=========================================================
// Data module
//=========================================================

export default class DataModule {

  constructor() {
    this.dependencies = ['nes', 'cartridgeFactory', 'systemModule', 'videoModule', 'audioModule', 'inputModule'];
  }

  inject(nes, cartridgeFactory, systemModule, videoModule, audioModule, inputModule) {
    this.nes = nes;
    this.cartridgeFactory = cartridgeFactory;
    this.systemModule = systemModule;
    this.modules = [systemModule, videoModule, audioModule, inputModule];
  }

  //=========================================================
  // ROM images
  //=========================================================

  loadROM(source) {
    if (typeof source === 'string') {
      return this.loadROMFromURL(source);
    }
    if (source instanceof File) {
      return this.loadROMFromFile(source);
    }
    if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
      return this.loadROMFromArray(source);
    }
    throw new Error('Unsupported source type');
  }

  loadROMFromURL(url) {
    logger.info(`Downloading ROM image from URL "${url}"`);
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest;
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        if (request.status === 200) {
          this.loadROMFromArray(request.response).then(resolve, reject);
        } else if (request.status === 0) {
          reject(new Error('Unable to connect to the server.'));
        } else {
          reject(new Error(`Unable to download file (server response: ${request.status} ${request.statusText}).`));
        }
      };
      request.onerror = () => {
        reject(new Error('Unable to connect to the server.'));
      };
      request.send();
    });
  }

  loadROMFromFile(file) {
    logger.info('Loading ROM image from file');
    return new Promise((resolve, reject) => {
      if (file.size > FILE_SIZE_LIMIT) {
        return reject(new Error(`Input file is too large (${formatSize(file.size)}).`));
      }
      var reader = new FileReader;
      reader.onload = event => {
        this.loadROMFromArray(event.target.result).then(resolve, reject);
      };
      reader.onerror = event => {
        reject(new Error(event.target.error || 'Unknown error'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  loadROMFromArray(array) {
    logger.info('Loading ROM image from array');
    return new Promise(resolve => {
      var cartridge = this.cartridgeFactory.readArray(array);
      this.nes.insertCartridge(cartridge);
      if (this.systemModule.isRunning()) {
        this.systemModule.restart();
      }
      resolve();
    });
  }

  unloadROM() {
    if (this.isROMLoaded()) {
      logger.info('Unloading ROM image');
      this.nes.removeCartridge();
    }
  }

  isROMLoaded() {
    return this.nes.getCartridge() != null;
  }

  getSHA1() {
    var cartridge = this.nes.getCartridge();
    return cartridge ? cartridge.sha1 : null;
  }

  //=========================================================
  // Non-Volatile RAM
  //=========================================================

  getNVRAMSize() {
    logger.info('Getting NVRAM size');
    return this.nes.getNVRAMSize();
  }

  getNVRAM() {
    logger.info('Getting NVRAM');
    return this.nes.getNVRAM();
  }

  setNVRAM(data) {
    logger.info('Setting NVRAM');
    return this.nes.setNVRAM(data);
  }

  loadNVRAM() {
    return new Promise((resolve, reject) => {
      if (this.getNVRAMSize() === 0) {
        return resolve();
      }
      var sha1 = this.getSHA1();
      if (sha1 == null) {
        logger.warn('Unable to load NVRAM: SHA-1 of loaded ROM image is not avaialable');
        return resolve();
      }
      logger.info('Loading NVRAM');
      this.getDB().then(db => {
        var transaction = db.transaction('nvram', 'readonly');
        var store = transaction.objectStore('nvram');
        var request = store.get(sha1);
        request.onsuccess = () => {
          try {
            if (request.result && request.result.data) {
              this.setNVRAM(request.result.data);
            }
            resolve();
          } catch(error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  saveNVRAM() {
    return new Promise((resolve, reject) => {
      var data = this.getNVRAM();
      if (data == null) {
        return resolve();
      }
      var sha1 = this.getSHA1();
      if (sha1 == null) {
        logger.warn('Unable to save NVRAM: SHA-1 of loaded ROM image is not avaialable');
        return resolve();
      }
      logger.info('Saving NVRAM');
      this.getDB().then(db => {
        var transaction = db.transaction('nvram', 'readwrite');
        var store = transaction.objectStore('nvram');
        var request = store.put({'sha1': sha1, 'date': data});
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  deleteNVRAMs() {
    logger.info('Deleting all saved NVRAMs');
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        var transaction = db.transaction('nvram', 'readwrite');
        var store = transaction.objectStore('nvram');
        var request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        logger.info(`Opening database ${DB_NAME} (version ${DB_VERSION})`);
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Database is blocked and cannot be upgraded.'));
        request.onupgradeneeded = event => {
          logger.info(`Upgrading database from version ${event.oldVersion} to ${event.newVersion}`);
          request.result.createObjectStore('nvram', {keyPath: 'sha1'});
        };
      });
    }
    return this.dbPromise;
  }

  //=========================================================
  // Configuration
  //=========================================================

  getOptions() {
    logger.info('Getting configuration options');
    var options = {};
    for (var module of this.modules) {
      for (var option of module.options) {
        options[option.name] = option.get.call(module);
      }
    }
    return options;
  }

  setOptions(options) {
    logger.info('Setting configuration options');
    for (var module of this.modules) {
      for (var option of module.options) {
        var value = options[option.name];
        if (value !== undefined) {
          option.set.call(module, value);
        }
      }
    }
  }

  resetOptions(options) {
    logger.info('Reseting configuration options');
    for (var module of this.modules) {
      for (var option of module.options) {
        if (options == null || options.indexOf(option.name) >= 0) {
          option.set.call(module, option.def);
        }
      }
    }
  }

  loadOptions() {
    logger.info('Loading configuration options');
    var value = localStorage.getItem(OPTIONS_KEY);
    if (value) {
      this.setOptions(stringToObject(value));
    }
  }

  saveOptions() {
    var options = this.getOptions();
    logger.info('Saving configuration options');
    localStorage.setItem(OPTIONS_KEY, objectToString(options));
  }

  deleteOptions() {
    logger.info('Deleting configuration options');
    localStorage.removeItem(OPTIONS_KEY);
  }

}
