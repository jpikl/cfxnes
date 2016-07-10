import log from '../../../core/src/common/log';
import {nvramStore} from './database';

export default class NVRAM {

  constructor(nes) {
    log.info('Initializing NVRAM access');
    this.nes = nes;
  }

  getSize() {
    log.info('Getting NVRAM size');
    return this.nes.getNVRAMSize();
  }

  get() {
    log.info('Getting NVRAM');
    return this.nes.getNVRAM();
  }

  set(data) {
    log.info('Setting NVRAM');
    return this.nes.setNVRAM(data);
  }

  load() {
    return new Promise((resolve, reject) => {
      if (this.getSize()) {
        const sha1 = this.nes.getCartridge().sha1;
        if (sha1) {
          nvramStore.get(sha1)
            .then(data => data && this.set(data))
            .then(resolve, reject);
          return;
        }
        log.warn('Unable to load NVRAM: SHA-1 of loaded ROM image is not available');
      }
      resolve();
    });
  }

  save() {
    return new Promise((resolve, reject) => {
      const data = this.get();
      if (data) {
        const sha1 = this.nes.getCartridge().sha1;
        if (sha1) {
          nvramStore.put(sha1, data).then(resolve, reject);
          return;
        }
        log.warn('Unable to save NVRAM: SHA-1 of loaded ROM image is not available');
      }
      resolve();
    });
  }

  delete() {
    return nvramStore.clear();
  }

}
