/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import Joypad from '../../../core/src/devices/Joypad';
import Zapper from '../../../core/src/devices/Zapper';
import Devices from '../../src/input/Devices';

describe('input/Devices', () => {
  const classes = {joypad: Joypad, zapper: Zapper};
  let devices, nes;

  beforeEach(() => {
    nes = new NES;
    devices = new Devices(nes);
  });

  it('should have joypad and zapper as default devices on ports #1 and #2', () => {
    expectJoypadOnPort(1);
    expectZapperOnPort(2);
  });

  for (const port of [1, 2]) {
    for (const name in classes) {
      it(`should set/get ${name} device on port #${port}`, () => {
        devices.set(port, name);
        expectDeviceOnPort(port, name, classes[name]);
      });
    }
  }

  for (const port of [1, 2]) {
    it(`should unset device on port #${port}`, () => {
      devices.set(port, null);
      expectDeviceOnPort(port, null, null);
    });
  }

  it('should get device configuration', () => {
    devices.set(1, 'zapper');
    devices.set(2, 'joypad');
    expect(devices.getAll()).to.deep.equal(['zapper', 'joypad']);
  });

  it('should set device configuration', () => {
    devices.setAll(['zapper', 'joypad']);
    expectZapperOnPort(1);
    expectJoypadOnPort(2);
  });

  for (const name in classes) {
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

  function expectJoypadOnPort(port) {
    expectDeviceOnPort(port, 'joypad', Joypad);
  }

  function expectZapperOnPort(port) {
    expectDeviceOnPort(port, 'zapper', Zapper);
  }

  function expectDeviceOnPort(port, deviceName, deviceClass) {
    expect(devices.get(port)).to.be.equal(deviceName);
    if (deviceClass) {
      expect(nes.getInputDevice(port)).to.be.an.instanceof(deviceClass);
    } else {
      expect(nes.getInputDevice(port)).to.be.null;
    }
  }
});
