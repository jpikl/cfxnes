/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import Joypad from '../../../core/src/devices/Joypad';
import InputRouter from '../../src/input/InputRouter';
import InputMapper from '../../src/input/InputMapper';
import Devices from '../../src/input/Devices';
import SourceInput from '../../src/input/SourceInput';

describe('input/InputRouter', () => {
  let nes, mapper, devices, router;

  beforeEach(() => {
    nes = new NES;
    mapper = new InputMapper;
    mapper.unmap();
    devices = new Devices(nes);
    const video = {mouseToOutputCoordinates: (x, y) => [x + 1, y + 1]};
    router = new InputRouter(mapper, devices, video);
  });

  it('should not route unmapped input', () => {
    devices.set(1, 'joypad');
    const result = router.routeInput(new SourceInput('keyboard', 'x', true));
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isButtonPressed(Joypad.A)).to.be.false;
  });

  it('should route mapped input', () => {
    devices.set(1, 'joypad');
    mapper.map('1.joypad.a', 'keyboard.x');
    const result = router.routeInput(new SourceInput('keyboard', 'x'), true);
    expect(result).to.be.true;
    expect(nes.getInputDevice(1).isButtonPressed(Joypad.A)).to.be.true;
  });

  for (const port of [1, 2]) {
    it(`should route and transform mouse coordinates to zapper on port ${port}`, () => {
      devices.set(port, 'zapper');
      const result = router.routeInput(new SourceInput('mouse', 'cursor'), [10, 20]);
      expect(result).to.be.true;
      expect(nes.getInputDevice(port).getBeamPosition()).to.deep.equal([11, 21]);
    });
  }
});
