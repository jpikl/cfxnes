import logger from '../../../core/src/utils/logger';
import { formatSize } from '../../../core/src/utils/format';

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

//=========================================================
// Cartridge manager
//=========================================================

export default class CartridgeManager {

  constructor() {
    this.dependencies = ['nes', 'cartridgeFactory', 'executionManager', 'persistenceManager'];
  }

  inject(nes, cartridgeFactory, executionManager, persistenceManager) {
    this.nes = nes;
    this.cartridgeFactory = cartridgeFactory;
    this.executionManager = executionManager;
    this.persistenceManager = persistenceManager;
  }

  //=========================================================
  // Cartridge loading
  //=========================================================

  loadCartridge(file) {
    logger.info('Loding cartridge from file');
    return new Promise((resolve, reject) => {
      if (file.size > FILE_SIZE_LIMIT) {
        reject(new Error(`Input file is too large (${formatSize(file.size)}).`));
        return;
      }
      var reader = new FileReader;
      reader.onload = event => {
        this.insertCartridge(event.target.result).then(resolve, reject);
      };
      reader.onerror = event => {
        reject(new Error(event.target.error || 'Unknown error'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  downloadCartridge(url) {
    logger.info(`Downloading cartridge from "${url}"`);
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest;
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        if (request.status === 200) {
          this.insertCartridge(request.response).then(resolve, reject);
        } else if (request.status === 0) {
          reject(new Error('Unable to connect to server.'));
        } else {
          reject(new Error(`Unable to download file (server response: ${request.status} ${request.statusText}).`));
        }
      };
      request.onerror = () => {
        reject(new Error('Unable to connect to server.'));
      };
      request.send();
    });
  }

  //=========================================================
  // Cartridge processing
  //=========================================================

  insertCartridge(arrayBuffer) {
    return new Promise((resolve, reject) => {
      var cartridge = this.cartridgeFactory.fromArrayBuffer(arrayBuffer);
      this.removeCartridge().then(() => {
        logger.info('Inserting cartridge');
        this.nes.insertCartridge(cartridge);
        return this.persistenceManager.loadCartridgeData().catch(error => {
          logger.error(error); // Do not propagate loadCartridgeData errors!
        });
      }).then(() => {
        if (this.executionManager.isRunning()) {
          this.executionManager.restart();
        }
        resolve();
      }).catch(reject);
    });
  }

  removeCartridge() {
    if (this.isCartridgeInserted()) {
      return new Promise((resolve, reject) => {
        this.persistenceManager.saveCartridgeData().then(() => {
          logger.info('Removing cartridge');
          this.nes.removeCartridge();
          resolve();
        }, error => {
          logger.error(error); // Do not propagate saveCartridgeData errors!
        }).catch(reject);
      });
    }
    return Promise.resolve();
  }

  isCartridgeInserted() {
    return this.nes.isCartridgeInserted();
  }

}
