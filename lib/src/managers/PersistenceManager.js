import logger from '../../../core/src/utils/logger';

//=========================================================
// Persistence manager
//=========================================================

export default class PersistenceManager {

  constructor() {
    this.dependencies = ['nes', 'storageFactory', 'executionManager', 'videoManager', 'audioManager', 'inputManager'];
    this.saveOnClose = false;
    this.saveAll = () => {
      Promise.all([
        this.saveCartridgeData(),
        this.saveConfiguration(),
      ]).catch(error => {
        logger.error(error);
      });
    };
  }

  inject(nes,  storageFactory, executionManager, videoManager, audioManager, inputManager) {
    this.nes = nes;
    this.storageFactory = storageFactory;
    this.executionManager = executionManager;
    this.videoManager = videoManager;
    this.audioManager = audioManager;
    this.inputManager = inputManager;
    this.setStorage();
  }

  //=========================================================
  // Storage
  //=========================================================

  setStorage(implementer = 'memory') {
    var id = this.storageFactory.getStorageId(implementer);
    logger.info(`Using "${id}" storage`);
    this.storage = this.storageFactory.createStorage(id, implementer);
    this.storageImplementer = implementer;
  }

  getStorage() {
    return this.storageImplementer;
  }

  //=========================================================
  // Save on close
  //=========================================================

  setSaveOnClose(enabled) {
    if (this.saveOnClose !== enabled) {
      this.saveOnClose = enabled;
      if (enabled) {
        logger.info('Enabling save on close');
        window.addEventListener('beforeunload', this.saveAll);
      } else {
        logger.info('Disabling save on close');
        window.removeEventListener('beforeunload', this.saveAll);
      }
    }
  }

  isSaveOnClose() {
    return this.saveOnClose;
  }

  //=========================================================
  // Periodic save
  //=========================================================

  setSavePeriod(period) {
    if (this.savePeriod !== period) {
      this.savePeriod = period;
      if (this.saveId) {
        logger.info('Disabling periodic save');
        clearInterval(this.saveId);
        this.saveId = null;
      }
      if (period) {
        logger.info('Enabling periodic save with period ' + period + ' s');
        this.saveId = setInterval(this.saveAll, 1000 * period);
      }
    }
  }

  getSavePeriod() {
    return this.savePeriod;
  }

  //=========================================================
  // Cartridge data
  //=========================================================

  loadCartridgeData() {
    if (this.nes.isCartridgeInserted()) {
      logger.info('Loading cartridge data');
      return this.nes.loadCartridgeData(this.storage);
    }
    return Promise.resolve();
  }

  saveCartridgeData() {
    if (this.nes.isCartridgeInserted()) {
      logger.info('Saving cartridge data');
      return this.nes.saveCartridgeData(this.storage);
    }
    return Promise.resolve();
  }

  deleteAllCartridgeData() {
    logger.info('Deleting all cartridge data');
    return this.storage.deleteRAM();
  }

  //=========================================================
  // Configuration
  //=========================================================

  loadConfiguration() {
    logger.info('Loading configuration');
    return this.storage.readConfiguration().then(config => {
      return new Promise((resolve, reject) => {
        if (config) {
          this.writeConfiguration(config);
        }
        resolve();
      });
    });
  }

  saveConfiguration() {
    logger.info('Saving configuration');
    return new Promise((resolve, reject) => {
      this.storage.writeConfiguration(this.readConfiguration()).then(resolve, reject);
    });
  }

  deleteConfiguration() {
    logger.info('Deleting configuration');
    return this.storage.deleteConfiguration();
  }

  readConfiguration() {
    var config = {};
    this.executionManager.readConfiguration(config);
    this.videoManager.readConfiguration(config);
    this.audioManager.readConfiguration(config);
    this.inputManager.readConfiguration(config);
    return config;
  }

  writeConfiguration(config) {
    this.executionManager.writeConfiguration(config);
    this.videoManager.writeConfiguration(config);
    this.audioManager.writeConfiguration(config);
    this.inputManager.writeConfiguration(config);
  }

}
