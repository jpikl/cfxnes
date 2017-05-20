import {expect} from 'chai';
import Joypad, {Button} from '../../src/devices/Joypad';

describe('devices/Joypad', () => {
  const nes = {};
  let joypad;

  const buttons = [
    Button.A, Button.B,
    Button.SELECT, Button.START,
    Button.UP, Button.DOWN,
    Button.LEFT, Button.RIGHT,
  ];

  beforeEach(() => {
    joypad = new Joypad;
    joypad.connect(nes);
  });

  afterEach(() => {
    joypad.disconnect(nes);
  });

  for (const button of buttons) {
    it(`has button #${button} not pressed by default`, () => {
      expect(joypad.isButtonPressed(button)).to.be.false;
    });
  }

  for (const button of buttons) {
    it(`changes button #${button} state`, () => {
      joypad.setButtonPressed(button, true);
      expect(joypad.isButtonPressed(button)).to.be.true;
      joypad.setButtonPressed(button, false);
      expect(joypad.isButtonPressed(button)).to.be.false;
    });
  }

  it('reads correct initial state', () => {
    expect(read()).to.deep.equal(state());
  });

  for (let i = 0; i < buttons.length; i++) {
    it(`reads correct state when button #${buttons[i]} is pressed`, () => {
      joypad.setButtonPressed(buttons[i], true);
      expect(read()).to.deep.equal(state(i));
    });
  }

  it('reads the same state repeatedly', () => {
    joypad.setButtonPressed(Button.A, true);
    expect(read()).to.deep.equal(state(0));
    expect(read()).to.deep.equal(state(0));
  });

  it('strobes to reset read position', () => {
    joypad.setButtonPressed(Button.A, true);
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
