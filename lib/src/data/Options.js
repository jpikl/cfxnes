import {assert} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';

const STORAGE_KEY = 'cfxnes.options';
const {localStorage} = window;

export default class Options {

  constructor() {
    this.options = [];
  }

  add(keys, {set, get}) {
    const def = get();
    const reset = () => set(def);
    const path = keys.join('.');
    this.options.push({keys, path, set, get, reset});
  }

  get() {
    log.info('Getting options');
    const values = {};
    for (const {keys, get} of this.options) {
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
    assert(values && typeof values === 'object', 'Invalid options');
    log.info('Setting options');
    for (const {keys, set} of this.options) {
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

  reset(...paths) {
    if (paths.length) {
      log.info(`Reseting ${paths} options`);
      for (const path of paths) {
        for (const option of this.options) {
          if (option.path.startsWith(path)) {
            option.reset();
          }
        }
      }
    } else {
      log.info('Reseting all options');
      this.options.forEach(o => o.reset());
    }
  }

  load() {
    log.info('Loading options');
    const values = localStorage.getItem(STORAGE_KEY);
    if (values) {
      this.set(JSON.parse(values));
    }
  }

  save() {
    const values = this.get();
    log.info('Saving options');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }

  delete() {
    log.info('Deleting options');
    localStorage.removeItem(STORAGE_KEY);
  }

}
