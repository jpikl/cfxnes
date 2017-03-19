import {toString} from '../../../../core/src/common/utils';

export default class ZapperAdapter {

  constructor(zapper) {
    this.zapper = zapper;
  }

  getDevice() {
    return this.zapper;
  }

  setInput(name, value) {
    if (name === 'trigger') {
      if (typeof value !== 'boolean') {
        throw new Error('Invalid zapper trigger state: ' + toString(value));
      }
      this.zapper.setTriggerPressed(value);
    } else if (name === 'beam') {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Invalid zapper beam position: ' + toString(value));
      }
      const [x, y] = value;
      if (typeof x !== 'number') {
        throw new Error('Invalid zapper beam X position: ' + toString(x));
      }
      if (typeof y !== 'number') {
        throw new Error('Invalid zapper beam Y position: ' + toString(y));
      }
      this.zapper.setBeamPosition(x, y);
    } else {
      throw new Error('Invalid zapper input: ' + toString(name));
    }
  }

  getInput(name) {
    if (name === 'trigger') {
      return this.zapper.isTriggerPressed();
    }
    if (name === 'beam') {
      return this.zapper.getBeamPosition();
    }
    throw new Error('Invalid zapper input: ' + toString(name));
  }

}
