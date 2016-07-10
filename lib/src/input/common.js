import SourceInput from './SourceInput';
import DeviceInput from './DeviceInput';

export const PORTS = [1, 2];

export function parseInput(inputStr) {
  const input = DeviceInput.fromString(inputStr) || SourceInput.fromString(inputStr);
  if (input) {
    return input;
  }
  throw new Error(`Invalid input ${inputStr}`);
}
