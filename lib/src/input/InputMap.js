import {toString} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';
import {parseInput} from './common';

export default class InputMap {

  constructor() {
    log.info('Initializing input map');
    this.items = [];
  }

  set(...args) {
    if (args.length === 1) {
      this.setAll(args[0]);
    } else if (args.length === 2) {
      this.setOne(args[0], args[1]);
    } else {
      throw new Error('Invalid number of arguments: expected 1 or 2 but got ' + args.length);
    }
  }

  setAll(mapping) {
    if (!mapping || typeof mapping !== 'object') {
      throw new Error('Invalid mapping: ' + toString(mapping));
    }
    this.deleteAll();
    for (const devInputStr in mapping) {
      this.setOne(devInputStr, mapping[devInputStr]);
    }
  }

  setOne(devInputStr, srcInputStrArray) {
    if (typeof devInputStr !== 'string') {
      throw new Error('Invalid device input: ' + toString(devInputStr));
    }
    if (typeof srcInputStrArray === 'string') {
      srcInputStrArray = [srcInputStrArray];
    } else if (!Array.isArray(srcInputStrArray)) {
      throw new Error('Invalid source input(s): ' + toString(srcInputStrArray));
    }
    const devInput = parseInput(devInputStr);
    for (const srcInputStr of srcInputStrArray) {
      const srcInput = parseInput(srcInputStr);
      if (!this.has(devInput, srcInput)) {
        log.info(`Mapping "${devInput}" device input to "${srcInput}" source input`);
        this.items.push({devInput, srcInput});
      }
    }
  }

  get(...args) {
    if (args.length === 0) {
      return this.getAll();
    }
    if (args.length === 1) {
      return this.getOne(args[0]);
    }
    throw new Error('Invalid number of arguments: expected 0 or 1 but got ' + args.length);
  }

  getAll() {
    const mapping = {};
    for (const item of this.items) {
      const devInputStr = item.devInput.toString();
      const srcInputStr = item.srcInput.toString();
      mapping[devInputStr] = mapping[devInputStr] || [];
      mapping[devInputStr].push(srcInputStr);
    }
    return mapping;
  }

  getOne(inputStr) {
    if (typeof inputStr !== 'string') {
      throw new Error('Invalid input: ' + toString(inputStr));
    }
    const result = [];
    const input = parseInput(inputStr);
    this.forEach(input, mappedInput => {
      result.push(mappedInput.toString());
    });
    return result;
  }

  delete(...args) {
    if (args.length) {
      for (const inputStr of args) {
        this.deleteOne(inputStr);
      }
    } else {
      this.deleteAll();
    }
  }

  deleteAll() {
    log.info('Unmapping all inputs');
    this.items.length = 0;
  }

  deleteOne(inputStr) {
    if (typeof inputStr !== 'string') {
      throw new Error('Invalid input: ' + toString(inputStr));
    }
    const input = parseInput(inputStr);
    if (input instanceof DeviceInput) {
      log.info(`Unmapping "${input}" device input`);
      this.items = this.items.filter(item => !item.devInput.equals(input));
    } else if (input instanceof SourceInput) {
      log.info(`Unmapping "${input}" source input`);
      this.items = this.items.filter(item => !item.srcInput.equals(input));
    }
  }

  has(devInput, srcInput) {
    for (const item of this.items) {
      if (item.devInput.equals(devInput) && item.srcInput.equals(srcInput)) {
        return true;
      }
    }
    return false;
  }

  forEach(input, callback) {
    if (input instanceof DeviceInput) {
      for (const item of this.items) {
        if (item.devInput.equals(input)) {
          callback(item.srcInput);
        }
      }
    } else if (input instanceof SourceInput) {
      for (const item of this.items) {
        if (item.srcInput.equals(input)) {
          callback(item.devInput);
        }
      }
    }
  }

}
