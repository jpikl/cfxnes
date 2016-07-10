/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import {parseInput} from '../../src/input/common';
import DeviceInput from '../../src/input/DeviceInput';
import SourceInput from '../../src/input/SourceInput';

describe('input/common', () => {
  it('should parse source input string', () => {
    expect(parseInput('keyboard.x')).to.be.an.instanceof(SourceInput);
  });

  it('should parse device input string', () => {
    expect(parseInput('1.joypad.a')).to.be.an.instanceof(DeviceInput);
  });

  it('should throw error for invalid input string', () => {
    expect(() => parseInput('x')).to.throw(Error);
  });
});
