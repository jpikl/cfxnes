/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Joypad from '../../src/devices/Joypad';

describe('Joypad', () => {
  const nes = {};
  let joypad;

  beforeEach(() => {
    joypad = new Joypad;
    joypad.connect(nes);
  });

  afterEach(() => {
    joypad.disconnect(nes);
  });

  it('should read state', () => {
    expect(read()).to.deep.equal(state());
    joypad.setButtonPressed(Joypad.A, true);
    expect(read()).to.deep.equal(state([0]));
    joypad.setButtonPressed(Joypad.B, true);
    expect(read()).to.deep.equal(state([0, 1]));
    joypad.setButtonPressed(Joypad.SELECT, true);
    expect(read()).to.deep.equal(state([0, 1, 2]));
    joypad.setButtonPressed(Joypad.START, true);
    expect(read()).to.deep.equal(state([0, 1, 2, 3]));
    joypad.setButtonPressed(Joypad.UP, true);
    expect(read()).to.deep.equal(state([0, 1, 2, 3, 4]));
    joypad.setButtonPressed(Joypad.DOWN, true);
    expect(read()).to.deep.equal(state([0, 1, 2, 3, 4, 5]));
    joypad.setButtonPressed(Joypad.LEFT, true);
    expect(read()).to.deep.equal(state([0, 1, 2, 3, 4, 5, 6]));
    joypad.setButtonPressed(Joypad.RIGHT, true);
    expect(read()).to.deep.equal(state([0, 1, 2, 3, 4, 5, 6, 7]));
  });

  it('should strobe to reset read position', () => {
    joypad.setButtonPressed(Joypad.A, true);
    expect(read(10)).to.deep.equal(state([0], 10));
    joypad.strobe();
    expect(read(10)).to.deep.equal(state([0], 10));
  });

  function read(length = 24) {
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(joypad.read());
    }
    return result;
  }

  function state(activePositions = [], length = 24) {
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = ~~(i === 19 || activePositions.indexOf(i) >= 0);
    }
    return result;
  }
});
