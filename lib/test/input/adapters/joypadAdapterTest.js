import Joypad from '../../../../core/src/devices/Joypad';
import JoypadAdapter from '../../../src/input/adapters/JoypadAdapter';

describe('input/adapters/JoypadAdapter', () => {
  let joypad, adapter;

  const buttons = [
    ['a', Joypad.A],
    ['b', Joypad.B],
    ['start', Joypad.START],
    ['select', Joypad.SELECT],
    ['up', Joypad.UP],
    ['down', Joypad.DOWN],
    ['left', Joypad.LEFT],
    ['right', Joypad.RIGHT],
  ];

  beforeEach(() => {
    joypad = new Joypad;
    adapter = new JoypadAdapter(joypad);
  });

  it('provides adapted device', () => {
    expect(adapter.getDevice()).to.be.equal(joypad);
  });

  for (const [name, id] of buttons) {
    it(`updates "${name}" button`, () => {
      adapter.updateInput(name, true);
      expect(joypad.isButtonPressed(id)).to.be.true;
      adapter.updateInput(name, false);
      expect(joypad.isButtonPressed(id)).to.be.false;
    });
  }
});
