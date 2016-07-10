import log from '../../../core/src/common/log';

const STORAGE_KEY = 'CFxNES.options';
const {localStorage} = window;

export default class Options {

  static of(...holders) {
    log.info(`Merging options of ${holders.length} holders`);
    let options = [];
    for (const holder of holders) {
      options = options.concat(holder.options.options);
    }
    return new Options(null, options);
  }

  constructor(target, options = []) {
    this.target = target;
    this.options = options;
  }

  add(name, set, get, def) {
    log.info(`Defining ${name} option`);
    const target = this.target;
    this.options.push({target, name, set, get, def});
  }

  get() {
    log.info('Getting options');
    const values = {};
    for (const option of this.options) {
      values[option.name] = option.get.call(option.target);
    }
    return values;
  }

  set(values) {
    log.info('Setting options');
    for (const option of this.options) {
      if (option.name in values) {
        option.set.call(option.target, values[option.name]);
      }
    }
  }

  reset(...names) {
    log.info(`Reseting ${names.length ? names : 'all'} options`);
    for (const option of this.options) {
      if (!names.length || names.indexOf(option.name) >= 0) {
        option.set.call(option.target, option.def);
      }
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
    const values = this.get(true);
    log.info('Saving options');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }

  delete() {
    log.info('Deleting options');
    localStorage.removeItem(STORAGE_KEY);
  }

}
