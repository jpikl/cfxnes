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
    expect(() => parseInput()).to.throw('Invalid input');
    expect(() => parseInput(1)).to.throw('Invalid input');
    expect(() => parseInput('x')).to.throw('Invalid input');
    expect(() => parseInput('x.x.x.x')).to.throw('Invalid input');
  });

  it('throws error for invalid source input string', () => {
    expect(() => parseInput('x.x')).to.throw('Invalid input source');
    expect(() => parseInput('keyboard0.x')).to.throw('Invalid input source');
    expect(() => parseInput('mouse0.x')).to.throw('Invalid input source');
    expect(() => parseInput('gamepad.x')).to.throw('Invalid input source');
  });

  it('throws error for invalid device input string', () => {
    expect(() => parseInput('x.joypad.a')).to.throw('Invalid input port');
    expect(() => parseInput('0.joypad.a')).to.throw('Invalid input port');
    expect(() => parseInput('3.joypad.a')).to.throw('Invalid input port');
    expect(() => parseInput('1.x.a')).to.throw('Invalid input device');
  });
});
