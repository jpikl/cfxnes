import {log, describe} from '../../../core';
import {SourceInput, DeviceInput, parseInput} from './inputs';

export default class InputMap {

  constructor() {
    log.info('Initializing input map');
    this.items = []; // Array of source/device input pairs
  }

  setAll(mapping) {
    if (!mapping || typeof mapping !== 'object') {
      throw new Error('Invalid mapping: ' + describe(mapping));
    }

    this.deleteAll();

    for (const devInputStr in mapping) {
      const srcInputValue = mapping[devInputStr];

      if (typeof srcInputValue === 'string') {
        this.set(devInputStr, srcInputValue);
      } else if (Array.isArray(srcInputValue)) {
        for (const srcInputStr of srcInputValue) {
          this.set(devInputStr, srcInputStr);
        }
      } else {
        throw new Error('Invalid source input(s): ' + describe(srcInputValue));
      }
    }
  }

  set(devInputStr, srcInputStr) {
    const devInput = parseInput(devInputStr, DeviceInput);
    const srcInput = parseInput(srcInputStr, SourceInput);

    if (!this.has(devInput, srcInput)) {
      log.info(`Mapping "${devInput}" input to "${srcInput}"`);
      this.items.push({devInput, srcInput});
    }
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

  get(inputStr) {
    const result = [];
    const input = parseInput(inputStr);

    this.forEach(input, mappedInput => {
      result.push(mappedInput.toString());
    });

    return result;
  }

  deleteAll() {
    log.info('Unmapping all inputs');
    this.items.length = 0;
  }

  delete(inputStr) {
    const input = parseInput(inputStr);
    log.info(`Unmapping "${input}" input`);

    this.items = this.items.filter(({devInput, srcInput}) => {
      return !devInput.equals(input) && !srcInput.equals(input);
    });
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
