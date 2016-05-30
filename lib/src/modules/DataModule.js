import {formatSize} from '../../../core/src/utils/format';
import logger from '../../../core/src/utils/logger';

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
    if (source instanceof Array || source instanceof ArrayBuffer || source instanceof Uint8Array) {
      return this.loadROMFromArray(source);
    }
    throw new Error('Unsupported source type');
  }

  loadROMFromURL(url) {
    logger.info(`Downloading ROM image from URL "${url}"`);
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest;
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
        reject(new Error(`Input file is too large (${formatSize(file.size)}).`));
        return;
      }
      const reader = new FileReader;
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
      const cartridge = this.cartridgeFactory.readArray(array);
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
    const cartridge = this.nes.getCartridge();
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
        resolve();
        return;
      }
      const sha1 = this.getSHA1();
      if (sha1 == null) {
        logger.warn('Unable to load NVRAM: SHA-1 of loaded ROM image is unavaialable');
        resolve();
        return;
      }
      logger.info('Loading NVRAM');
      this.getDB().then(db => {
        const transaction = db.transaction('nvram', 'readonly');
        const store = transaction.objectStore('nvram');
        const request = store.get(sha1);
        request.onsuccess = () => {
          try {
            if (request.result && request.result['data']) {
              this.setNVRAM(request.result['data']);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  saveNVRAM() {
    return new Promise((resolve, reject) => {
      const data = this.getNVRAM();
      if (data == null) {
        resolve();
        return;
      }
      const sha1 = this.getSHA1();
      if (sha1 == null) {
        logger.warn('Unable to save NVRAM: SHA-1 of loaded ROM image is unavaialable');
        resolve();
        return;
      }
      logger.info('Saving NVRAM');
      this.getDB().then(db => {
        const transaction = db.transaction('nvram', 'readwrite');
        const store = transaction.objectStore('nvram');
        const request = store.put({'sha1': sha1, 'data': data});
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  deleteNVRAMs() {
    logger.info('Deleting all stored NVRAMs');
    return new Promise((resolve, reject) => {
      this.getDB().then(db => {
        const transaction = db.transaction('nvram', 'readwrite');
        const store = transaction.objectStore('nvram');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        logger.info(`Opening database ${DB_NAME} (version ${DB_VERSION})`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
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

  getOptions(ignoreTransient = false) {
    logger.info('Getting configuration options');
    const options = {};
    for (const module of this.modules) {
      for (const option of module.options) {
        if (!ignoreTransient || !option.transient) {
          options[option.name] = option.get.call(module);
        }
      }
    }
    return options;
  }

  setOptions(options) {
    logger.info('Setting configuration options');
    for (const module of this.modules) {
      for (const option of module.options) {
        const value = options[option.name];
        if (value !== undefined) {
          option.set.call(module, value);
        }
      }
    }
  }

  resetOptions(...options) {
    logger.info(`Reseting ${options.length ? options : 'all'} configuration options`);
    for (const module of this.modules) {
      for (const option of module.options) {
        if (!options.length || options.indexOf(option.name) >= 0) {
          option.set.call(module, option.def);
        }
      }
    }
  }

  loadOptions() {
    logger.info('Loading configuration options');
    const value = localStorage.getItem(OPTIONS_KEY);
    if (value) {
      this.setOptions(JSON.parse(value));
    }
  }

  saveOptions() {
    const options = this.getOptions(true);
    logger.info('Saving configuration options');
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
  }

  deleteOptions() {
    logger.info('Deleting configuration options');
    localStorage.removeItem(OPTIONS_KEY);
  }

}
