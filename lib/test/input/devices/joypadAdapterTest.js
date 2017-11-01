import {Joypad, Button} from '../../../../core';
import JoypadAdapter from '../../../src/input/devices/JoypadAdapter';

describe('input/devices/JoypadAdapter', () => {
  let joypad, adapter;

  const buttons = [
    ['a', Button.A],
    ['b', Button.B],
    ['start', Button.START],
    ['select', Button.SELECT],
    ['up', Button.UP],
    ['down', Button.DOWN],
    ['left', Button.LEFT],
    ['right', Button.RIGHT],
  ];

  beforeEach(() => {
    joypad = new Joypad;
    adapter = new JoypadAdapter(joypad);
  });

  it('provides adapted device', () => {
    expect(adapter.getDevice()).to.equal(joypad);
  });

  for (const [name, id] of buttons) {
    it(`changes "${name}" button state`, () => {
      adapter.setInput(name, true);
      expect(adapter.getInput(name)).to.be.true;
      expect(joypad.isButtonPressed(id)).to.be.true;
      adapter.setInput(name, false);
      expect(adapter.getInput(name)).to.be.false;
      expect(joypad.isButtonPressed(id)).to.be.false;
    });
  }

  it('throws error for invalid button state', () => {
    expect(() => adapter.setInput('a', null)).to.throw('Invalid joypad button state: null');
  });

  it('throws error for invalid button', () => {
    expect(() => adapter.getInput(null)).to.throw('Invalid joypad button: null');
    expect(() => adapter.setInput(null, true)).to.throw('Invalid joypad button: null');
  });
});
