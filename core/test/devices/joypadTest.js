/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import {expect} from 'chai';
import Joypad from '../../src/devices/Joypad';

describe('devices/Joypad', () => {
  const nes = {};
  let joypad;

  const buttons = [
    Joypad.A, Joypad.B,
    Joypad.SELECT, Joypad.START,
    Joypad.UP, Joypad.DOWN,
    Joypad.LEFT, Joypad.RIGHT,
  ];

  beforeEach(() => {
    joypad = new Joypad;
    joypad.connect(nes);
  });

  afterEach(() => {
    joypad.disconnect(nes);
  });

  for (const button of buttons) {
    it(`should get/set button #${button} pressed`, () => {
      expect(joypad.isButtonPressed(button)).to.be.false;
      joypad.setButtonPressed(button, true);
      expect(joypad.isButtonPressed(button)).to.be.true;
    });
  }

  it('should read correct initial state', () => {
    expect(read()).to.deep.equal(state());
  });

  for (let i = 0; i < buttons.length; i++) {
    it(`should read correct state when button #${buttons[i]} is pressed`, () => {
      joypad.setButtonPressed(buttons[i], true);
      expect(read()).to.deep.equal(state(i));
    });
  }

  it('read the same state repeatedly', () => {
    joypad.setButtonPressed(Joypad.A, true);
    expect(read()).to.deep.equal(state(0));
    expect(read()).to.deep.equal(state(0));
  });

  it('should strobe to reset read position', () => {
    joypad.setButtonPressed(Joypad.A, true);
    expect(read(10)).to.deep.equal(state(0, 10));
    joypad.strobe();
    expect(read(10)).to.deep.equal(state(0, 10));
  });

  function read(length = 24) {
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(joypad.read());
    }
    return result;
  }

  function state(activePosition, length = 24) {
    const result = new Array(length).fill(0);
    if (activePosition != null) {
      result[activePosition] = 1;
    }
    if (length > 19) {
      result[19] = 1;
    }
    return result;
  }
});
