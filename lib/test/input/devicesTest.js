/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import Joypad from '../../../core/src/devices/Joypad';
import Zapper from '../../../core/src/devices/Zapper';
import Devices from '../../src/input/Devices';

describe('input/Devices', () => {
  let devices, nes;
  const deviceClasses = {joypad: Joypad, zapper: Zapper};

  beforeEach(() => {
    nes = new NES;
    devices = new Devices(nes);
  });

  for (const port of [1, 2]) {
    for (const name in deviceClasses) {
      it(`should get/set ${name} device on port ${port}`, () => {
        devices.set(port, name);
        expect(devices.get(port)).to.be.equal(name);
        expect(nes.getInputDevice(port)).to.be.an.instanceof(deviceClasses[name]);
      });
    }
  }

  for (const port of [1, 2]) {
    it(`should unset device on port ${port}`, () => {
      devices.set(port, null);
      expect(devices.get(port)).to.be.null;
      expect(nes.getInputDevice(port)).to.be.null;
    });
  }

  it('should get/set devices on all ports at once', () => {
    devices.setAll(['zapper', 'joypad']);
    expect(devices.getAll()).to.deep.equal(['zapper', 'joypad']);
    expect(nes.getInputDevice(1)).to.be.an.instanceof(Zapper);
    expect(nes.getInputDevice(2)).to.be.an.instanceof(Joypad);
  });

  for (const name in deviceClasses) {
    it(`should provide a different instance of ${name} for each port`, () => {
      devices.set(1, name);
      devices.set(2, name);
      expect(nes.getInputDevice(1)).to.be.not.equal(nes.getInputDevice(2));
    });
  }

  it('should update device input', () => {
    devices.set(2, 'zapper');
    devices.updateInput(2, 'zapper', 'beam', [10, 20]);
    expect(nes.getInputDevice(2).getBeamPosition()).to.deep.equal([10, 20]);
  });
});
