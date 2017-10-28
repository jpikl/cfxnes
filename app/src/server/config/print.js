import {makeSeparator} from '../common';

export default function print(config, stream) {
  stream.write(`\n${makeSeparator('-', 80, 'config')}\n`);
  for (const [key, value] of Object.entries(config)) {
    stream.write(` ${key}=${value}\n`);
  }
  stream.write(`${makeSeparator('-', 80)}\n\n`);
}
