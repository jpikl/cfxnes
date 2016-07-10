import log from '../../../core/src/common/log';
import {createCartridge} from '../../../core/src/data/cartridge';
import {fetchURL, readFile} from './load';

export default class DataModule {

  constructor(nes, libs, system) {
    log.info('Initializing ROM loader');
    this.nes = nes;
    this.libs = libs;
    this.system = system;
  }

  load(source) {
    if (typeof source === 'string') {
      return fetchURL(source).then(data => this.loadData(data));
    }
    if (source instanceof File) {
      return readFile(source).then(data => this.loadData(data));
    }
    if (source instanceof Array || source instanceof ArrayBuffer || source instanceof Uint8Array) {
      return this.loadData(source);
    }
    throw new Error('Unsupported source type');
  }

  loadData(data) {
    log.info('Loading ROM image');
    return new Promise(resolve => {
      const cartridge = createCartridge(data, this.libs);
      this.nes.setCartridge(cartridge);
      if (this.system.isRunning()) {
        this.system.restart();
      }
      resolve();
    });
  }

  unload() {
    if (this.isLoaded()) {
      log.info('Unloading ROM image');
      this.nes.setCartridge(null);
    }
  }

  isLoaded() {
    return this.nes.getCartridge() != null;
  }

}
