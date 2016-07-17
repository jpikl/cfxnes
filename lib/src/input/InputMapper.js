import log from '../../../core/src/common/log';
import Options from '../data/Options';
import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';
import {parseInput} from './common';

export default class InputMapper {

  constructor() {
    log.info('Initializing input mapper');
    this.initOptions();
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('inputMapping', this.setMapping, this.getMapping, {
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
    this.options.reset();
  }

  setMapping(mapping) {
    this.unmap();
    for (const devInputStr in mapping) {
      const srcInputStrArray = mapping[devInputStr];
      this.map(devInputStr, srcInputStrArray);
    }
  }

  getMapping() {
    const mapping = {};
    for (const item of this.items) {
      const devInputStr = item.devInput.toString();
      const srcInputStr = item.srcInput.toString();
      mapping[devInputStr] = mapping[devInputStr] || [];
      mapping[devInputStr].push(srcInputStr);
    }
    return mapping;
  }

  map(devInputStr, srcInputStrArray) {
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

  unmap(...inputStrArray) {
    if (inputStrArray.length) {
      for (const inputStr of inputStrArray) {
        const input = parseInput(inputStr);
        if (input instanceof DeviceInput) {
          log.info(`Unmapping "${input}" device input`);
          this.items = this.items.filter(item => !item.devInput.equals(input));
        } else if (input instanceof SourceInput) {
          log.info(`Unmapping "${input}" source input`);
          this.items = this.items.filter(item => !item.srcInput.equals(input));
        }
      }
    } else {
      log.info('Unmapping all inputs');
      this.items = [];
    }
  }

  getMatches(inputStr) {
    const result = [];
    const input = parseInput(inputStr);
    this.forEachMatch(input, mappedInput => {
      result.push(mappedInput.toString());
    });
    return result;
  }

  forEachMatch(input, callback) {
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
