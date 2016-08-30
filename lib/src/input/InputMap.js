import {assert} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';
import {parseInput} from './common';

export default class InputMap {

  constructor() {
    log.info('Initializing input map');
    this.setAll({
      '1.joypad.a': 'keyboard.x',
      '1.joypad.b': ['keyboard.y', 'keyboard.z'],
      '1.joypad.start': 'keyboard.enter',
      '1.joypad.select': 'keyboard.shift',
      '1.joypad.up': 'keyboard.up',
      '1.joypad.down': 'keyboard.down',
      '1.joypad.left': 'keyboard.left',
      '1.joypad.right': 'keyboard.right',
      '2.zapper.trigger': 'mouse.left',
    });
  }

  setAll(inputs) {
    assert(inputs && typeof inputs === 'object', 'Invalid inputs');
    this.clear();
    for (const devInputStr in inputs) {
      const srcInputStrArray = inputs[devInputStr];
      this.put(devInputStr, srcInputStrArray);
    }
  }

  getAll() {
    const inputs = {};
    for (const item of this.items) {
      const devInputStr = item.devInput.toString();
      const srcInputStr = item.srcInput.toString();
      inputs[devInputStr] = inputs[devInputStr] || [];
      inputs[devInputStr].push(srcInputStr);
    }
    return inputs;
  }

  put(devInputStr, srcInputStrArray) {
    assert(typeof devInputStr === 'string', 'Invalid device input');
    assert(typeof srcInputStrArray === 'string' || srcInputStrArray instanceof Array, 'Invalid source input(s)');

    if (typeof srcInputStrArray === 'string') {
      srcInputStrArray = [srcInputStrArray];
    }

    const devInput = parseInput(devInputStr);
    for (const srcInputStr of srcInputStrArray) {
      const srcInput = parseInput(srcInputStr);
      if (!this.contains(devInput, srcInput)) {
        log.info(`Mapping "${devInput}" device input to "${srcInput}" source input`);
        this.items.push({devInput, srcInput});
      }
    }
  }

  contains(devInput, srcInput) {
    for (const item of this.items) {
      if (item.devInput.equals(devInput) && item.srcInput.equals(srcInput)) {
        return true;
      }
    }
    return false;
  }

  removeAll(...inputStrArray) {
    if (inputStrArray.length) {
      for (const inputStr of inputStrArray) {
        this.remove(inputStr);
      }
    } else {
      this.clear();
    }
  }

  remove(inputStr) {
    const input = parseInput(inputStr);
    if (input instanceof DeviceInput) {
      log.info(`Unmapping "${input}" device input`);
      this.items = this.items.filter(item => !item.devInput.equals(input));
    } else if (input instanceof SourceInput) {
      log.info(`Unmapping "${input}" source input`);
      this.items = this.items.filter(item => !item.srcInput.equals(input));
    }
  }

  clear() {
    log.info('Unmapping all inputs');
    this.items = [];
  }

  get(inputStr) {
    assert(typeof inputStr === 'string', 'Invalid input');
    const result = [];
    const input = parseInput(inputStr);
    this.forEach(input, mappedInput => {
      result.push(mappedInput.toString());
    });
    return result;
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
