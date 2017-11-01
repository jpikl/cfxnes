import {NES, Joypad, Zapper} from '../../../core';
import Devices from '../../src/input/Devices';

describe('input/Devices', () => {
  const classes = {joypad: Joypad, zapper: Zapper};
  let devices, nes;

  beforeEach(() => {
    nes = new NES;
    devices = new Devices(nes);
  });

  it('has joypad and zapper as default devices on ports #1 and #2', () => {
    expectJoypadOnPort(1);
    expectZapperOnPort(2);
  });

  for (const port of [1, 2]) {
    for (const name in classes) {
      it(`sets ${name} on port #${port}`, () => {
        devices.set(port, name);
        expectDeviceOnPort(port, name, classes[name]);
      });
    }
  }

  for (const port of [1, 2]) {
    it(`removes device on port #${port}`, () => {
      devices.set(port, null);
      expectNoneOnPort(port);
    });
  }

  it('throws error when setting invalid device', () => {
    expect(() => devices.set(1)).to.throw('Invalid device: undefined');
    expect(() => devices.set(1, 'x')).to.throw('Invalid device: "x"');
  });

  it('throws error when setting device on invalid port', () => {
    expect(() => devices.set()).to.throw('Invalid port: undefined');
    expect(() => devices.set('x', 'joypad')).to.throw('Invalid port: "x"');
    expect(() => devices.set(0, 'joypad')).to.throw('Invalid port: 0');
    expect(() => devices.set(3, 'joypad')).to.throw('Invalid port: 3');
  });

  it('throws error when getting device on invalid port', () => {
    expect(() => devices.get()).to.throw('Invalid port: undefined');
    expect(() => devices.get('x')).to.throw('Invalid port: "x"');
    expect(() => devices.get(0)).to.throw('Invalid port: 0');
    expect(() => devices.get(3)).to.throw('Invalid port: 3');
  });

  for (const name in classes) {
    it(`provides a different ${name} instance for each port`, () => {
      devices.set(1, name);
      devices.set(2, name);
      expect(nes.getInputDevice(1)).not.to.equal(nes.getInputDevice(2));
    });
  }

  it('changes device input', () => {
    devices.set(1, null); // To make sure device does not have to be connected to NES
    devices.set(2, null);
    devices.setInput('1.joypad.a', true);
    expect(devices.getInput('1.joypad.a')).to.be.true;
    devices.setInput('2.zapper.beam', [10, 20]);
    expect(devices.getInput('2.zapper.beam', [10, 20])).to.deep.equal([10, 20]);
  });

  function expectJoypadOnPort(port) {
    expectDeviceOnPort(port, 'joypad', Joypad);
  }

  function expectZapperOnPort(port) {
    expectDeviceOnPort(port, 'zapper', Zapper);
  }

  function expectNoneOnPort(port) {
    expectDeviceOnPort(port, null, null);
  }

  function expectDeviceOnPort(port, deviceName, deviceClass) {
    expect(devices.get(port)).to.equal(deviceName);
    if (deviceClass) {
      expect(nes.getInputDevice(port)).to.be.an.instanceof(deviceClass);
    } else {
      expect(nes.getInputDevice(port)).to.be.null;
    }
  }
});
