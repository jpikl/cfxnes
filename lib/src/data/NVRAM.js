import log from '../../../core/src/common/log';
import {nvramStore} from './database';

export default class NVRAM {

  constructor(nes) {
    log.info('Initializing NVRAM access');
    this.nes = nes;
  }

  data() {
    log.info('Accessing NVRAM data');
    return this.nes.getNVRAM();
  }

  load() {
    return new Promise((resolve, reject) => {
      const nvram = this.data();
      if (nvram) {
        const sha1 = this.nes.getCartridge().sha1;
        nvramStore.get(sha1)
          .then(data => data && nvram.set(data))
          .then(resolve, reject);
      } else {
        resolve();
      }
    });
  }

  save() {
    return new Promise((resolve, reject) => {
      const nvram = this.data();
      if (nvram) {
        const sha1 = this.nes.getCartridge().sha1;
        nvramStore.put(sha1, nvram).then(resolve, reject);
      } else {
        resolve();
      }
    });
  }

  deleteAll() {
    return nvramStore.clear();
  }

}
