import {Port, Device, Source} from '../enums';

export function createDevicesFromControls(controls) {
  const devices = {};
  for (const port of Port.values) {
    devices[port] = Device.toOptional(controls[port].device);
  }
  return devices;
}

export function createInputsFromControls(controls) {
  const inputs = {};
  for (const port of Port.values) {
    for (const device of Device.values) {
      for (const name of Device.getInputNames(device)) {
        const deviceInputId = Device.getInputId({port, device, name});
        const sourceInputs = controls[port].inputs[device][name];
        inputs[deviceInputId] = sourceInputs.map(Source.getInputId);
      }
    }
  }
  return inputs;
}

export function copyControlsFromNes(nes) {
  const controls = {};
  for (const port of Port.values) {
    controls[port] = {
      device: Device.fromOptional(nes.devices[port]),
      inputs: copyInputsFromNes(nes, port),
    };
  }
  return controls;
}

export function copyInputsFromNes(nes, port) {
  const inputs = {};
  for (const device of Device.values) {
    inputs[device] = {};
    if (device !== Device.NONE) {
      for (const name of Device.getInputNames(device)) {
        const deviceInputId = Device.getInputId({port, device, name});
        const sourceInputIds = nes.inputs.map.get(deviceInputId);
        inputs[device][name] = sourceInputIds.map(Source.parseInputId);
      }
    }
  }
  return inputs;
}
