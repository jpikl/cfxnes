import {describeValue} from '../../../../core';

export const ZAPPER_TRIGGER = 'trigger';
export const ZAPPER_BEAM = 'beam';

export default class ZapperAdapter {

  constructor(zapper) {
    this.zapper = zapper;
  }

  getDevice() {
    return this.zapper;
  }

  setInput(name, value) {
    if (name === ZAPPER_TRIGGER) {
      if (typeof value !== 'boolean') {
        throw new Error('Invalid zapper trigger state: ' + describeValue(value));
      }
      this.zapper.setTriggerPressed(value);
    } else if (name === ZAPPER_BEAM) {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Invalid zapper beam position: ' + describeValue(value));
      }
      const [x, y] = value;
      if (typeof x !== 'number') {
        throw new Error('Invalid zapper beam X position: ' + describeValue(x));
      }
      if (typeof y !== 'number') {
        throw new Error('Invalid zapper beam Y position: ' + describeValue(y));
      }
      this.zapper.setBeamPosition(x, y);
    } else {
      throw new Error('Invalid zapper input: ' + describeValue(name));
    }
  }

  getInput(name) {
    if (name === 'trigger') {
      return this.zapper.isTriggerPressed();
    }
    if (name === 'beam') {
      return this.zapper.getBeamPosition();
    }
    throw new Error('Invalid zapper input: ' + describeValue(name));
  }

}
