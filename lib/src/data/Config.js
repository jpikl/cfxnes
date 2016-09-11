import {assert} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';

export default class Config {

  constructor() {
    this.items = [];
  }

  add(keys, {set, get}) {
    this.items.push({keys, set, get});
  }

  get() {
    log.info('Getting configuration');
    const values = {};
    for (const {keys, get} of this.items) {
      const value = get();
      if (value !== undefined) {
        const last = keys.length - 1;
        let obj = values;
        for (let i = 0; i < last; i++) {
          const key = keys[i];
          obj = obj[key] || (obj[key] = {});
        }
        if (value !== undefined) {
          obj[keys[last]] = value;
        }
      }
    }
    return values;
  }

  set(values) {
    assert(values && typeof values === 'object', 'Invalid configuration');
    log.info('Setting configuration');
    for (const {keys, set} of this.items) {
      const last = keys.length - 1;
      let obj = values;
      for (let i = 0; i <= last; i++) {
        const key = keys[i];
        if (key in obj) {
          if (i === last) {
            set(obj[key]);
          } else {
            obj = obj[key];
          }
        } else {
          break;
        }
      }
    }
  }

}
