import {describe} from '../../../../core';
import {isPort} from '../ports';
import {isDevice} from '../devices';
import sources from '../sources';
import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';

export default function parseInput(inputStr, expectedType = undefined) {
  if (typeof inputStr === 'string') {
    if (expectedType == null || expectedType === SourceInput) {
      const srcInput = SourceInput.fromString(inputStr);
      if (srcInput) {
        validateSourceInput(srcInput);
        return srcInput;
      }
    }
    if (expectedType == null || expectedType === DeviceInput) {
      const devInput = DeviceInput.fromString(inputStr);
      if (devInput) {
        validateDeviceInput(devInput);
        return devInput;
      }
    }
  }
  if (expectedType != null) {
    const typeName = expectedType === SourceInput ? 'source' : 'device';
    throw new Error(`Invalid ${typeName} input: ${describe(inputStr)}`);
  }
  throw new Error('Invalid input: ' + describe(inputStr));
}

function validateSourceInput(input) {
  const {source} = input;
  const sourceBase = source.replace(/[0-9]+$/, '');
  const sourceDesc = sources[sourceBase];
  const indexed = source !== sourceBase;
  if (!sourceDesc || sourceDesc.indexed !== indexed) {
    throw new Error('Invalid input source: ' + describe(source));
  }
}

function validateDeviceInput(input) {
  const {port, device} = input;
  if (!isPort(port)) {
    throw new Error('Invalid input port: ' + describe(port));
  }
  if (!isDevice(device)) {
    throw new Error('Invalid input device: ' + describe(device));
  }
}
