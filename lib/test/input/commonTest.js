/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import {parseInput} from '../../src/input/common';
import DeviceInput from '../../src/input/DeviceInput';
import SourceInput from '../../src/input/SourceInput';

describe('input/common', () => {
  it('parses source input string', () => {
    expect(parseInput('keyboard.x')).to.be.an.instanceof(SourceInput);
    expect(parseInput('mouse.x')).to.be.an.instanceof(SourceInput);
    expect(parseInput('gamepad0.x')).to.be.an.instanceof(SourceInput);
  });

  it('parses device input string', () => {
    expect(parseInput('1.joypad.a')).to.be.an.instanceof(DeviceInput);
    expect(parseInput('2.zapper.trigger')).to.be.an.instanceof(DeviceInput);
  });

  it('throws error for invalid input string', () => {
    expect(() => parseInput('x')).to.throw(Error);
    expect(() => parseInput('x.x.x.x')).to.throw(Error);
  });

  it('throws error for invalid source input string', () => {
    expect(() => parseInput('unknonw.x')).to.throw(Error);
    expect(() => parseInput('keyboard0.x')).to.throw(Error);
    expect(() => parseInput('mouse0.x')).to.throw(Error);
    expect(() => parseInput('gamepad.x')).to.throw(Error);
  });

  it('throws error for invalid device input string', () => {
    expect(() => parseInput('x.joypad.a')).to.throw(Error);
    expect(() => parseInput('0.joypad.a')).to.throw(Error);
    expect(() => parseInput('1.unknown.a')).to.throw(Error);
    expect(() => parseInput('3.joypad.a')).to.throw(Error);
  });
});
