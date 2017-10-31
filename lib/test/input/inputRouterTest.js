import {NES, Button} from '../../../core';
import {InputMap, Devices} from '../../src/input';
import {SourceInput} from '../../src/input/inputs';
import InputRouter from '../../src/input/InputRouter';

describe('input/InputRouter', () => {
  let nes, map, devices, video, router;

  beforeEach(() => {
    nes = new NES;
    map = new InputMap;
    devices = new Devices(nes);
    video = {
      getOutput: () => ({}),
      getOutputRect: () => ({left: 0, right: 256, top: 0, bottom: 240, width: 240, height: 256}),
      getOutputCoordinates: (x, y) => [x + 1, y + 1],
    };
    router = new InputRouter(map, devices, video);
  });

  it('does not route unmapped input', () => {
    devices.set(1, 'joypad');
    const result = router.routeInput(new SourceInput('keyboard', 'x', true));
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isButtonPressed(Button.A)).to.be.false;
  });

  it('routes mapped input', () => {
    devices.set(1, 'joypad');
    map.set('1.joypad.a', 'keyboard.x');
    const result = router.routeInput(new SourceInput('keyboard', 'x'), true);
    expect(result).to.be.true;
    expect(nes.getInputDevice(1).isButtonPressed(Button.A)).to.be.true;
  });

  for (const port of [1, 2]) {
    it(`routes and transforms mouse coordinates to zapper on port ${port}`, () => {
      devices.set(port, 'zapper');
      const result = router.routeInput(new SourceInput('mouse', 'cursor'), [10, 20]);
      expect(result).to.be.true;
      expect(nes.getInputDevice(port).getBeamPosition()).to.deep.equal([11, 21]);
    });
  }

  it('does not route mouse inputs when there is no video output', () => {
    video.getOutput = () => null;
    devices.set(1, 'zapper');
    map.set('1.zapper.trigger', 'mouse.left');
    let result;

    result = router.routeInput(new SourceInput('mouse', 'cursor'), [10, 20]);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).getBeamPosition()).to.deep.equal([-1, -1]);

    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.false;
  });

  it('routes only mouse clicks pointing to video output', () => {
    devices.set(1, 'zapper');
    map.set('1.zapper.trigger', 'mouse.left');
    let result;

    router.routeInput(new SourceInput('mouse', 'cursor'), [-10, 20]);
    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.false;

    router.routeInput(new SourceInput('mouse', 'cursor'), [10, -20]);
    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.false;

    router.routeInput(new SourceInput('mouse', 'cursor'), [1000, 20]);
    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.false;

    router.routeInput(new SourceInput('mouse', 'cursor'), [10, 2000]);
    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.false;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.false;

    router.routeInput(new SourceInput('mouse', 'cursor'), [10, 20]);
    result = router.routeInput(new SourceInput('mouse', 'left'), true);
    expect(result).to.be.true;
    expect(nes.getInputDevice(1).isTriggerPressed()).to.be.true;
  });
});
